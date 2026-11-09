import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { audit } from '../services/audit.js';

const router = Router();
router.use(requireAuth);

const pageIdSchema = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const assignmentSchema = z.object({
  classIds: z.array(z.string().length(36)).max(500),
  studentIds: z.array(z.string().length(36)).max(2000),
});
const settingKey = (pageId) => `shared-page:${pageId}`;

router.get('/assignments', requireRole('ADMIN'), async (_req, res) => {
  const rows = await prisma.setting.findMany({ where: { key: { startsWith: 'shared-page:' } } });
  res.json({
    assignments: rows.map((row) => ({
      pageId: row.key.slice('shared-page:'.length),
      classIds: Array.isArray(row.value?.classIds) ? row.value.classIds : [],
      studentIds: Array.isArray(row.value?.studentIds) ? row.value.studentIds : [],
    })),
  });
});

router.put('/:pageId/assignments', requireRole('ADMIN'), async (req, res) => {
  const pageId = pageIdSchema.safeParse(req.params.pageId);
  const parsed = assignmentSchema.safeParse(req.body);
  if (!pageId.success || !parsed.success) return res.status(400).json({ error: 'Invalid shared page assignments' });

  const classIds = [...new Set(parsed.data.classIds)];
  const studentIds = [...new Set(parsed.data.studentIds)];
  const [classes, students] = await Promise.all([
    prisma.class.findMany({ where: { id: { in: classIds } }, select: { id: true } }),
    prisma.user.findMany({ where: { id: { in: studentIds }, role: 'STUDENT', isActive: true }, select: { id: true } }),
  ]);
  if (classes.length !== classIds.length) return res.status(400).json({ error: 'One or more classes were not found' });
  if (students.length !== studentIds.length) return res.status(400).json({ error: 'One or more selected students are inactive or unavailable' });

  await prisma.setting.upsert({
    where: { key: settingKey(pageId.data) },
    create: { key: settingKey(pageId.data), value: { classIds, studentIds } },
    update: { value: { classIds, studentIds } },
  });
  await audit(req.user.id, 'SHARED_PAGE_ASSIGNED', {
    targetType: 'SharedPage',
    targetId: pageId.data,
    meta: { classes: classIds.length, students: studentIds.length },
    ip: req.ip,
  });
  res.json({ ok: true, classes: classIds.length, students: studentIds.length });
});

router.get('/access', requireRole('STUDENT'), async (req, res) => {
  const [rows, memberships] = await Promise.all([
    prisma.setting.findMany({ where: { key: { startsWith: 'shared-page:' } } }),
    prisma.classMember.findMany({ where: { studentId: req.user.id }, select: { classId: true } }),
  ]);
  const classIds = new Set(memberships.map((membership) => membership.classId));
  const pageIds = rows
    .filter((row) => {
      const assigned = row.value;
      return Array.isArray(assigned?.studentIds) && assigned.studentIds.includes(req.user.id)
        || Array.isArray(assigned?.classIds) && assigned.classIds.some((classId) => classIds.has(classId));
    })
    .map((row) => row.key.slice('shared-page:'.length))
    .filter((pageId) => pageIdSchema.safeParse(pageId).success);
  res.json({ pageIds });
});

export default router;
