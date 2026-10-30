import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateQuestion, TYPES, DIFFICULTIES } from '../services/questionSchema.js';
import { createQuestion, updateQuestion, serialize, questionInclude } from '../services/questionStore.js';
import { audit } from '../services/audit.js';
import { parseCsv, loadZip, analyze, buildTemplate, exportCsv, MAX_ROWS } from '../services/importer.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'TEACHER'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 2 } });
const uploadDir = path.resolve(config.uploadDir);

// Teachers see only their own questions; admins see all.
const scope = (req) => (req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id });
const sendCsv = (res, name, body) => {
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` });
  res.send(body);
};

// ---------- CSV templates / export / history ----------
router.get('/template/:kind', (req, res) => {
  const csv = buildTemplate(req.params.kind);
  if (!csv) return res.status(404).json({ error: 'Unknown template' });
  sendCsv(res, `template_${req.params.kind}.csv`, csv);
});

router.get('/export', async (req, res) => {
  const qs = await prisma.question.findMany({ where: scope(req), include: questionInclude, orderBy: { createdAt: 'asc' } });
  sendCsv(res, 'questions_export.csv', exportCsv(qs));
});

router.get('/categories', async (req, res) => {
  const rows = await prisma.question.groupBy({ by: ['category'], where: { ...scope(req), category: { not: null } } });
  res.json({ categories: rows.map((r) => r.category).sort() });
});

router.get('/imports', async (req, res) => {
  const logs = await prisma.importLog.findMany({
    where: req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, filename: true, mode: true, status: true, total: true, created: true, updated: true, createdAt: true },
  });
  res.json({ logs });
});

// ---------- CSV import (preview and commit) ----------
router.post('/import', upload.fields([{ name: 'csv', maxCount: 1 }, { name: 'images', maxCount: 1 }]), async (req, res) => {
  const csvFile = req.files?.csv?.[0];
  if (!csvFile) return res.status(400).json({ error: 'Please choose a CSV file' });
  const mode = req.body.mode === 'upsert' ? 'upsert' : 'create';
  const commit = req.body.commit === 'true';

  const parsed = parseCsv(csvFile.buffer);
  if (parsed.fatal) return res.status(400).json({ error: parsed.fatal });
  if (parsed.rows.length > MAX_ROWS) return res.status(400).json({ error: `Too many rows (max ${MAX_ROWS} per file)` });

  let zipImages = new Map();
  const zipFile = req.files?.images?.[0];
  if (zipFile) {
    try { zipImages = loadZip(zipFile.buffer); } catch (e) { return res.status(400).json({ error: `ZIP could not be read: ${e.message}` }); }
  }

  const ids = parsed.rows.map((r) => String(r.data.question_id || '').trim()).filter(Boolean);
  const existing = ids.length
    ? await prisma.question.findMany({ where: { ownerId: req.user.id, externalId: { in: ids } }, select: { id: true, externalId: true } })
    : [];
  const existingMap = new Map(existing.map((q) => [q.externalId, q.id]));
  const base = { headers: parsed.headers, rows: parsed.rows, mode, existingIds: new Set(existingMap.keys()), zipImages };

  const FAKE = '/api/media/00000000-0000-0000-0000-000000000000';
  const result = analyze({ ...base, urlFor: () => FAKE });
  const total = parsed.rows.length;
  const warnings = [];
  for (const [name, info] of zipImages) {
    if (info.ok && !result.used.has(name)) warnings.push(`Image '${name}' in the ZIP is not referenced by the CSV`);
  }

  const log = (status, extra = {}) =>
    prisma.importLog.create({
      data: { ownerId: req.user.id, filename: csvFile.originalname.slice(0, 255), mode, status, total, created: 0, updated: 0, ...extra },
    });

  if (!commit) {
    return res.json({
      summary: { total, valid: result.valid.length, invalid: total - result.valid.length, toCreate: result.valid.filter((v) => v.action === 'create').length, toUpdate: result.valid.filter((v) => v.action === 'update').length },
      errors: result.errors.slice(0, 200),
      errorCount: result.errors.length,
      warnings: warnings.slice(0, 50),
      preview: result.rows.slice(0, 5),
      canImport: result.errors.length === 0 && result.valid.length > 0,
    });
  }

  if (result.errors.length || !result.valid.length) {
    await log('FAILED', { errors: result.errors.slice(0, 200) });
    return res.status(400).json({ error: 'The file has errors. Nothing was imported.', errors: result.errors.slice(0, 200) });
  }

  // Commit: all or nothing. Files are written first, then one DB transaction; files are removed if it fails.
  const written = [];
  const mediaRows = [];
  const urls = new Map();
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    for (const key of result.used) {
      const info = zipImages.get(key);
      const id = randomUUID();
      const filename = `${id}.${info.ext}`;
      await fs.promises.writeFile(path.join(uploadDir, filename), info.buf);
      written.push(filename);
      urls.set(key, `/api/media/${id}`);
      mediaRows.push({ id, ownerId: req.user.id, filename, originalName: key.slice(0, 255), mime: info.mime, size: info.buf.length });
    }
    const final = analyze({ ...base, urlFor: (k) => urls.get(k) });
    const stats = await prisma.$transaction(
      async (tx) => {
        for (const m of mediaRows) await tx.media.create({ data: m });
        let created = 0, updated = 0;
        for (const item of final.valid) {
          if (item.action === 'update') { await updateQuestion(tx, existingMap.get(item.externalId), item.value); updated++; }
          else { await createQuestion(tx, req.user.id, item.value, item.externalId); created++; }
        }
        return { created, updated };
      },
      { timeout: 300000, maxWait: 10000 }
    );
    await log('SUCCESS', stats);
    await audit(req.user.id, 'QUESTIONS_IMPORTED', { targetType: 'ImportLog', meta: { file: csvFile.originalname.slice(0, 120), ...stats } });
    res.json({ ok: true, ...stats, total });
  } catch (e) {
    console.error('Import failed:', e);
    await Promise.all(written.map((f) => fs.promises.unlink(path.join(uploadDir, f)).catch(() => {})));
    await log('FAILED', { errors: [{ line: 0, message: 'Server error during import; nothing was saved' }] }).catch(() => {});
    res.status(500).json({ error: 'Import failed and was rolled back. Nothing was saved.' });
  }
});

// ---------- CRUD ----------
router.get('/', async (req, res) => {
  const { q, type, category, difficulty } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const where = { ...scope(req) };
  if (q) where.OR = [{ text: { contains: String(q) } }, { externalId: { contains: String(q) } }];
  if (TYPES.includes(type)) where.type = type;
  if (category) where.category = String(category);
  if (DIFFICULTIES.includes(difficulty)) where.difficulty = difficulty;
  const [total, rows] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize,
      include: { owner: { select: { name: true } }, _count: { select: { options: true } } },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id, externalId: r.externalId, type: r.type, text: r.text.slice(0, 120), hasImage: !!r.imageUrl,
    category: r.category, difficulty: r.difficulty, points: r.points, optionCount: r._count.options, owner: r.owner.name,
  }));
  res.json({ items, total, page, pageSize });
});

async function findOwned(req) {
  return prisma.question.findFirst({ where: { id: req.params.id, ...scope(req) }, include: questionInclude });
}

router.get('/:id', async (req, res) => {
  const q = await findOwned(req);
  q ? res.json({ question: serialize(q) }) : res.status(404).json({ error: 'Question not found' });
});

router.post('/', async (req, res) => {
  const r = validateQuestion(req.body || {});
  if (r.errors.length) return res.status(400).json({ error: r.errors[0], errors: r.errors });
  const q = await createQuestion(prisma, req.user.id, r.value);
  res.status(201).json({ question: serialize(q) });
});

router.put('/:id', async (req, res) => {
  if (!(await findOwned(req))) return res.status(404).json({ error: 'Question not found' });
  const r = validateQuestion(req.body || {});
  if (r.errors.length) return res.status(400).json({ error: r.errors[0], errors: r.errors });
  const q = await updateQuestion(prisma, req.params.id, r.value);
  res.json({ question: serialize(q) });
});

router.delete('/:id', async (req, res) => {
  if (!(await findOwned(req))) return res.status(404).json({ error: 'Question not found' });
  const inQuizzes = await prisma.quizQuestion.count({ where: { questionId: req.params.id } });
  if (inQuizzes > 0) return res.status(409).json({ error: `This question is used in ${inQuizzes} quiz(zes). Remove it from them first.` });
  await prisma.question.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/:id/duplicate', async (req, res) => {
  const src = await findOwned(req);
  if (!src) return res.status(404).json({ error: 'Question not found' });
  const s = serialize(src);
  const r = validateQuestion(s);
  if (r.errors.length) return res.status(400).json({ error: r.errors[0] });
  const q = await createQuestion(prisma, req.user.id, r.value);
  res.status(201).json({ question: serialize(q) });
});

export default router;
