import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse/sync';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeEmail, normalizePhone, PHONE_RE, randomPassword, publicUser } from '../utils.js';

const router = Router();
router.use(requireAuth);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

const phoneField = z.string().transform(normalizePhone).refine((v) => PHONE_RE.test(v), 'Invalid phone number');

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().transform(normalizeEmail),
  phone: phoneField,
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  userCode: z.string().trim().min(2).max(40).optional(),
  password: z.string().min(8).max(100).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().email().transform(normalizeEmail).optional(),
  phone: phoneField.optional(),
  isActive: z.boolean().optional(),
});

async function nextUserCode(role) {
  const prefix = { ADMIN: 'ADM', TEACHER: 'TCH', STUDENT: 'STU' }[role];
  let n = (await prisma.user.count({ where: { role } })) + 1;
  for (;;) {
    const code = `${prefix}${String(n).padStart(4, '0')}`;
    if (!(await prisma.user.findUnique({ where: { userCode: code } }))) return code;
    n++;
  }
}

function handleDbError(e, res) {
  if (e.code === 'P2002') {
    const field = String(e.meta?.target || '');
    const label = field.includes('email') ? 'Email' : field.includes('phone') ? 'Phone' : 'User code';
    return res.status(409).json({ error: `${label} already in use` });
  }
  if (e.code === 'P2025') return res.status(404).json({ error: 'User not found' });
  throw e;
}

// List: admin sees everyone; teacher sees students only
router.get('/', requireRole('ADMIN', 'TEACHER'), async (req, res) => {
  const { role, q } = req.query;
  const where = {};
  if (req.user.role === 'TEACHER') where.role = 'STUDENT';
  else if (role) where.role = String(role);
  if (q) {
    const s = String(q);
    where.OR = [{ name: { contains: s } }, { email: { contains: s } }, { phone: { contains: s } }, { userCode: { contains: s } }];
  }
  const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
  res.json({ users: users.map(publicUser) });
});

// Create: admin only (no self-registration)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const tempPassword = d.password || randomPassword();
  try {
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        userCode: d.userCode || (await nextUserCode(d.role)),
        passwordHash: await bcrypt.hash(tempPassword, 10),
        mustChangePassword: true,
        createdById: req.user.id,
      },
    });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'USER_CREATE', targetType: 'User', targetId: user.id, meta: { role: d.role } } });
    res.status(201).json({ user: publicUser(user), tempPassword });
  } catch (e) {
    handleDbError(e, res);
  }
});

router.post('/bulk-csv', requireRole('ADMIN'), upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a CSV file to upload' });
  const classId = String(req.body.classId || '');
  if (!z.string().uuid().safeParse(classId).success) return res.status(400).json({ error: 'Choose a valid class' });
  const targetClass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true } });
  if (!targetClass) return res.status(404).json({ error: 'Class not found' });

  let records;
  try {
    records = parseCsv(req.file.buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true, bom: true });
  } catch (error) {
    return res.status(400).json({ error: `Could not parse CSV: ${error.message}` });
  }
  if (!records.length) return res.status(400).json({ error: 'The CSV has no student rows' });
  if (records.length > 500) return res.status(400).json({ error: 'A single upload can contain at most 500 students' });
  const headers = Object.keys(records[0]);
  const missingHeaders = ['name', 'email', 'phone'].filter((header) => !headers.includes(header));
  if (missingHeaders.length) return res.status(400).json({ error: `Missing required CSV columns: ${missingHeaders.join(', ')}` });

  const errors = [];
  const validRows = [];
  const seenEmails = new Set();
  const seenPhones = new Set();
  const seenCodes = new Set();
  records.forEach((record, index) => {
    const parsed = createSchema.safeParse({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: 'STUDENT',
      ...(record.userCode ? { userCode: record.userCode } : {}),
    });
    if (!parsed.success) {
      errors.push({ row: index + 2, message: parsed.error.issues[0].message });
      return;
    }
    const student = parsed.data;
    if (seenEmails.has(student.email) || seenPhones.has(student.phone) || (student.userCode && seenCodes.has(student.userCode))) {
      errors.push({ row: index + 2, message: 'Email, phone, and user code must be unique within the CSV' });
      return;
    }
    seenEmails.add(student.email);
    seenPhones.add(student.phone);
    if (student.userCode) seenCodes.add(student.userCode);
    validRows.push({ ...student, tempPassword: randomPassword() });
  });
  if (errors.length) return res.status(400).json({ error: 'Fix the invalid rows and upload the CSV again. No users were created.', errors });

  const existing = await prisma.user.findMany({
    where: { OR: [
      { email: { in: validRows.map((row) => row.email) } },
      { phone: { in: validRows.map((row) => row.phone) } },
      { userCode: { in: validRows.map((row) => row.userCode).filter(Boolean) } },
    ] },
    select: { email: true, phone: true, userCode: true },
  });
  const existingEmails = new Set(existing.map((user) => user.email));
  const existingPhones = new Set(existing.map((user) => user.phone));
  const existingCodes = new Set(existing.map((user) => user.userCode));
  const collisionErrors = validRows.flatMap((row, index) => {
    const collisions = [];
    if (existingEmails.has(row.email)) collisions.push('email already exists');
    if (existingPhones.has(row.phone)) collisions.push('phone already exists');
    if (row.userCode && existingCodes.has(row.userCode)) collisions.push('user code already exists');
    return collisions.length ? [{ row: index + 2, message: collisions.join(', ') }] : [];
  });
  if (collisionErrors.length) return res.status(409).json({ error: 'Some records already exist. No users were created.', errors: collisionErrors });

  let nextStudentCode = 1;
  const allocatedCodes = new Set(existingCodes);
  validRows.forEach((row) => {
    if (row.userCode) return;
    let code;
    do {
      code = `STU${String(nextStudentCode).padStart(4, '0')}`;
      nextStudentCode += 1;
    } while (allocatedCodes.has(code) || seenCodes.has(code));
    row.userCode = code;
    allocatedCodes.add(code);
  });

  try {
    const passwordHashes = await Promise.all(validRows.map((row) => bcrypt.hash(row.tempPassword, 10)));
    validRows.forEach((row, index) => { row.passwordHash = passwordHashes[index]; });
    const createdUsers = await prisma.$transaction(async (tx) => {
      const users = [];
      for (const row of validRows) {
        const user = await tx.user.create({
          data: {
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: 'STUDENT',
            userCode: row.userCode,
            passwordHash: row.passwordHash,
            mustChangePassword: true,
            createdById: req.user.id,
          },
        });
        await tx.classMember.create({ data: { classId, studentId: user.id } });
        await tx.auditLog.create({ data: { actorId: req.user.id, action: 'USER_CREATE', targetType: 'User', targetId: user.id, meta: { role: 'STUDENT', source: 'csv', classId } } });
        users.push({ ...publicUser(user), tempPassword: row.tempPassword });
      }
      return users;
    }, { timeout: 120_000 });
    res.status(201).json({ created: createdUsers.length, classId, users: createdUsers });
  } catch (error) {
    handleDbError(error, res);
  }
});

router.patch('/bulk-status', requireRole('ADMIN'), async (req, res) => {
  const parsed = z.object({
    userIds: z.array(z.string().uuid()).min(1).max(500),
    isActive: z.boolean(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const userIds = [...new Set(parsed.data.userIds)];
  if (userIds.includes(req.user.id)) return res.status(400).json({ error: 'You cannot change your own account status' });
  const existing = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } });
  if (existing.length !== userIds.length) return res.status(404).json({ error: 'One or more selected users were not found' });
  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({ where: { id: { in: userIds } }, data: { isActive: parsed.data.isActive } });
    await tx.auditLog.createMany({
      data: userIds.map((targetId) => ({
        actorId: req.user.id,
        action: 'USER_UPDATE',
        targetType: 'User',
        targetId,
        meta: { isActive: parsed.data.isActive, bulk: true },
      })),
    });
  });
  res.json({ updated: userIds.length, isActive: parsed.data.isActive });
});

router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (req.params.id === req.user.id && parsed.data.isActive !== undefined) {
    return res.status(400).json({ error: 'You cannot change your own account status' });
  }
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: parsed.data });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'USER_UPDATE', targetType: 'User', targetId: user.id, meta: parsed.data } });
    res.json({ user: publicUser(user) });
  } catch (e) {
    handleDbError(e, res);
  }
});

router.post('/:id/reset-password', requireRole('ADMIN'), async (req, res) => {
  const tempPassword = randomPassword();
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash: await bcrypt.hash(tempPassword, 10), mustChangePassword: true, failedLogins: 0, lockedUntil: null },
    });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'PASSWORD_RESET', targetType: 'User', targetId: req.params.id } });
    res.json({ tempPassword });
  } catch (e) {
    handleDbError(e, res);
  }
});

router.post('/:id/unlock', requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { failedLogins: 0, lockedUntil: null } });
    await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'ACCOUNT_UNLOCKED', targetType: 'User', targetId: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    handleDbError(e, res);
  }
});

export default router;
