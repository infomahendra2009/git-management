import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { normalizeEmail, normalizePhone, PHONE_RE, randomPassword, publicUser } from '../utils.js';

const router = Router();
router.use(requireAuth);

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

router.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (req.params.id === req.user.id && parsed.data.isActive === false) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
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
