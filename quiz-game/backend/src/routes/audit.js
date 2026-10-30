import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

router.get('/actions', async (_req, res) => {
  const rows = await prisma.auditLog.groupBy({ by: ['action'] });
  res.json({ actions: rows.map((r) => r.action).sort() });
});

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = 50;
  const where = {};
  if (req.query.action) where.action = String(req.query.action);
  if (req.query.q) {
    const s = String(req.query.q);
    const users = await prisma.user.findMany({
      where: { OR: [{ name: { contains: s } }, { email: { contains: s } }, { userCode: { contains: s } }] }, select: { id: true }, take: 200,
    });
    where.actorId = { in: users.map((u) => u.id) };
  }
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  if ((from && isNaN(from)) || (to && isNaN(to))) return res.status(400).json({ error: 'Invalid date' });
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: new Date(to.getTime() + 86399999) } : {}) };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  const ids = [...new Set(rows.map((r) => r.actorId).filter(Boolean))];
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, userCode: true } }) : [];
  const byId = new Map(users.map((u) => [u.id, u]));
  res.json({
    total, page, pageSize,
    items: rows.map((r) => ({
      id: r.id, createdAt: r.createdAt, action: r.action, targetType: r.targetType, targetId: r.targetId, meta: r.meta,
      actor: r.actorId ? (byId.get(r.actorId)?.name ?? 'Deleted user') : null, actorCode: r.actorId ? byId.get(r.actorId)?.userCode : null,
    })),
  });
});

export default router;
