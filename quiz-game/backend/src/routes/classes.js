import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'TEACHER'));
const scope = (req) => (req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id });
const nameSchema = z.object({ name: z.string().trim().min(1).max(120) });

router.get('/', async (req, res) => {
  const rows = await prisma.class.findMany({
    where: scope(req), orderBy: { createdAt: 'desc' },
    include: { _count: { select: { members: true } }, owner: { select: { name: true } } },
  });
  res.json({ classes: rows.map((c) => ({ id: c.id, name: c.name, members: c._count.members, owner: c.owner.name })) });
});

router.post('/', async (req, res) => {
  const p = nameSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Class name is required' });
  const c = await prisma.class.create({ data: { name: p.data.name, ownerId: req.user.id } });
  res.status(201).json({ class: { id: c.id, name: c.name, members: 0 } });
});

async function owned(req) {
  return prisma.class.findFirst({ where: { id: req.params.id, ...scope(req) } });
}

router.get('/:id', async (req, res) => {
  const c = await owned(req);
  if (!c) return res.status(404).json({ error: 'Class not found' });
  const members = await prisma.classMember.findMany({ where: { classId: c.id }, select: { studentId: true } });
  res.json({ class: { id: c.id, name: c.name }, studentIds: members.map((m) => m.studentId) });
});

router.patch('/:id', async (req, res) => {
  const p = nameSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Class name is required' });
  if (!(await owned(req))) return res.status(404).json({ error: 'Class not found' });
  const c = await prisma.class.update({ where: { id: req.params.id }, data: { name: p.data.name } });
  res.json({ class: { id: c.id, name: c.name } });
});

router.delete('/:id', async (req, res) => {
  if (!(await owned(req))) return res.status(404).json({ error: 'Class not found' });
  await prisma.class.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Replace the full member list
router.put('/:id/members', async (req, res) => {
  const p = z.object({ studentIds: z.array(z.string().length(36)).max(2000) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid student list' });
  if (!(await owned(req))) return res.status(404).json({ error: 'Class not found' });
  const ids = [...new Set(p.data.studentIds)];
  const students = await prisma.user.findMany({ where: { id: { in: ids }, role: 'STUDENT' }, select: { id: true } });
  await prisma.$transaction([
    prisma.classMember.deleteMany({ where: { classId: req.params.id } }),
    prisma.classMember.createMany({ data: students.map((s) => ({ classId: req.params.id, studentId: s.id })) }),
  ]);
  res.json({ ok: true, members: students.length });
});

export default router;
