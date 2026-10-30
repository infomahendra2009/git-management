import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { prisma } from './db.js';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import questionRoutes from './routes/questions.js';
import mediaRoutes from './routes/media.js';
import classRoutes from './routes/classes.js';
import quizRoutes from './routes/quizzes.js';
import studentRoutes from './routes/student.js';
import reportRoutes from './routes/reports.js';
import gradingRoutes from './routes/grading.js';
import auditRoutes from './routes/audit.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  // Same-origin (Docker/nginx) needs no CORS. Set CORS_ORIGIN=https://a.com,https://b.com only if the web app is on another domain.
  if (config.corsOrigin) app.use(cors({ origin: config.corsOrigin.split(',').map((s) => s.trim()) }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  // Broad safety net. Many students can share one school IP, so the default is generous.
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: config.apiRatePerMinute, standardHeaders: true, legacyHeaders: false }));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/grading', gradingRoutes);
  app.use('/api/audit', auditRoutes);

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, _req, res, _next) => {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File is too large' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });
  return app;
}
