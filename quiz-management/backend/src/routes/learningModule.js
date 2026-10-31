import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { audit } from '../services/audit.js';

const router = Router();
router.use(requireAuth);

const assignmentSchema = z.object({
  classIds: z.array(z.string().length(36)).max(500),
  studentIds: z.array(z.string().length(36)).max(2000),
});

router.get('/assignments', requireRole('ADMIN'), async (_req, res) => {
  const [classes, students] = await Promise.all([
    prisma.solarSystemClassAssignment.findMany({ select: { classId: true } }),
    prisma.solarSystemStudentAssignment.findMany({ select: { studentId: true } }),
  ]);
  res.json({
    classIds: classes.map((assignment) => assignment.classId),
    studentIds: students.map((assignment) => assignment.studentId),
  });
});

router.put('/assignments', requireRole('ADMIN'), async (req, res) => {
  const parsed = assignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid module assignments' });

  const classIds = [...new Set(parsed.data.classIds)];
  const studentIds = [...new Set(parsed.data.studentIds)];
  const [classes, students] = await Promise.all([
    prisma.class.findMany({ where: { id: { in: classIds } }, select: { id: true } }),
    prisma.user.findMany({ where: { id: { in: studentIds }, role: 'STUDENT', isActive: true }, select: { id: true } }),
  ]);
  if (classes.length !== classIds.length) return res.status(400).json({ error: 'One or more classes were not found' });
  if (students.length !== studentIds.length) return res.status(400).json({ error: 'One or more selected students are inactive or unavailable' });

  await prisma.$transaction(async (tx) => {
    await tx.solarSystemClassAssignment.deleteMany();
    await tx.solarSystemStudentAssignment.deleteMany();
    if (classIds.length) {
      await tx.solarSystemClassAssignment.createMany({
        data: classIds.map((classId) => ({ classId, assignedById: req.user.id })),
      });
    }
    if (studentIds.length) {
      await tx.solarSystemStudentAssignment.createMany({
        data: studentIds.map((studentId) => ({ studentId, assignedById: req.user.id })),
      });
    }
  });

  await audit(req.user.id, 'SOLAR_SYSTEM_ASSIGNED', {
    targetType: 'LearningModule',
    targetId: 'solar-system',
    meta: { classes: classIds.length, students: studentIds.length },
  });
  res.json({ ok: true, classes: classIds.length, students: studentIds.length });
});

router.get('/access', requireRole('STUDENT'), async (req, res) => {
  const [direct, memberships] = await Promise.all([
    prisma.solarSystemStudentAssignment.findUnique({ where: { studentId: req.user.id }, select: { studentId: true } }),
    prisma.classMember.findMany({ where: { studentId: req.user.id }, select: { classId: true } }),
  ]);
  const classIds = memberships.map((membership) => membership.classId);
  const classAssignment = classIds.length
    ? await prisma.solarSystemClassAssignment.findFirst({ where: { classId: { in: classIds } }, select: { classId: true } })
    : null;
  res.json({ assigned: Boolean(direct || classAssignment) });
});

export default router;
