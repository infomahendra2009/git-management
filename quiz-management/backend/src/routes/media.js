import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { sniffImage, MAX_IMAGE_BYTES } from '../services/images.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } });
const dir = path.resolve(config.uploadDir);

// Public read: files are addressed by unguessable UUID so <img> tags work without auth headers.
router.get('/:id', async (req, res) => {
  const m = /^[0-9a-fA-F-]{36}$/.test(req.params.id) ? await prisma.media.findUnique({ where: { id: req.params.id } }) : null;
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.set({ 'Content-Type': m.mime, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=86400' });
  fs.createReadStream(path.join(dir, m.filename)).on('error', () => res.status(404).end()).pipe(res);
});

router.post('/', requireAuth, requireRole('ADMIN', 'TEACHER'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const kind = sniffImage(req.file.buffer);
  if (!kind) return res.status(400).json({ error: 'Only JPG, PNG, GIF or WebP images are allowed' });
  const id = randomUUID();
  const filename = `${id}.${kind.ext}`;
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(path.join(dir, filename), req.file.buffer);
  await prisma.media.create({
    data: { id, ownerId: req.user.id, filename, originalName: req.file.originalname.slice(0, 255), mime: kind.mime, size: req.file.size },
  });
  res.status(201).json({ id, url: `/api/media/${id}` });
});

export default router;
