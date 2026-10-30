import { prisma } from '../db.js';

// Never throws: an audit failure must not break the action being audited.
export async function audit(actorId, action, { targetType, targetId, meta, ip } = {}) {
  try {
    const m = { ...(meta || {}), ...(ip ? { ip } : {}) };
    await prisma.auditLog.create({
      data: { actorId: actorId || null, action, targetType: targetType || null, targetId: targetId ? String(targetId) : null, ...(Object.keys(m).length ? { meta: m } : {}) },
    });
  } catch (e) {
    console.error('audit log failed:', e.message);
  }
}
