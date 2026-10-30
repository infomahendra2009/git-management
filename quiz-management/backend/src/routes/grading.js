import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { regradeAttempt } from '../services/attempts.js';
import { audit } from '../services/audit.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'TEACHER'));

// Teachers mark only attempts on their own quizzes. Admins can mark any.
const scope = (req) => (req.user.role === 'ADMIN' ? {} : { quiz: { ownerId: req.user.id } });
const round2 = (x) => Math.round(x * 100) / 100;

router.get('/queue', async (req, res) => {
  const graded = req.query.status === 'graded';
  const rows = await prisma.attempt.findMany({
    where: {
      status: 'SUBMITTED', ...scope(req),
      ...(graded ? { needsGrading: false, questions: { some: { gradedAt: { not: null } } } } : { needsGrading: true }),
    },
    orderBy: { submittedAt: graded ? 'desc' : 'asc' },
    take: 200,
    include: { student: { select: { name: true, userCode: true } }, quiz: { select: { title: true } } },
  });
  res.json({
    attempts: rows.map((a) => ({
      id: a.id, student: a.student.name, userCode: a.student.userCode, quiz: a.quiz.title, attemptNo: a.attemptNo,
      submittedAt: a.submittedAt, percent: a.percent, passed: a.passed,
    })),
  });
});

async function loadAttempt(req) {
  return prisma.attempt.findFirst({
    where: { id: req.params.id, status: 'SUBMITTED', ...scope(req) },
    include: { student: { select: { name: true, userCode: true } }, quiz: { select: { title: true, passPercent: true } }, questions: { orderBy: { position: 'asc' } } },
  });
}

router.get('/attempts/:id', async (req, res) => {
  const a = await loadAttempt(req);
  if (!a) return res.status(404).json({ error: 'Attempt not found' });
  const essays = a.questions.filter((q) => q.snapshot.type === 'ESSAY');
  res.json({
    attempt: {
      id: a.id, student: a.student.name, userCode: a.student.userCode, quiz: a.quiz.title, attemptNo: a.attemptNo,
      submittedAt: a.submittedAt, needsGrading: a.needsGrading, score: a.score, maxScore: a.maxScore, percent: a.percent, passed: a.passed,
      autoScore: round2(a.questions.filter((q) => q.snapshot.type !== 'ESSAY').reduce((s, q) => s + (q.score || 0), 0)),
    },
    essays: essays.map((q) => ({
      id: q.id, number: q.position + 1, text: q.snapshot.text, imageUrl: q.snapshot.imageUrl, points: q.points,
      answerText: q.answer?.text ?? '', modelAnswer: q.snapshot.explanation || null,
      score: q.gradedAt ? q.score : null, feedback: q.feedback || '', gradedAt: q.gradedAt,
    })),
  });
});

const markSchema = z.object({ score: z.coerce.number().min(0), feedback: z.string().max(5000).nullish() });

router.put('/attempts/:id/questions/:qid', async (req, res) => {
  const p = markSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Enter a valid score and a feedback note under 5000 characters' });
  const a = await loadAttempt(req);
  if (!a) return res.status(404).json({ error: 'Attempt not found' });
  const q = a.questions.find((x) => x.id === req.params.qid && x.snapshot.type === 'ESSAY');
  if (!q) return res.status(404).json({ error: 'Essay question not found' });
  if (!String(q.answer?.text ?? '').trim()) return res.status(400).json({ error: 'The student left this answer blank, so it scored 0 automatically' });
  if (p.data.score > q.points) return res.status(400).json({ error: `The score cannot be more than ${q.points}` });

  await prisma.attemptQuestion.update({
    where: { id: q.id },
    data: { score: round2(p.data.score), isCorrect: null, gradedAt: new Date(), gradedById: req.user.id, feedback: p.data.feedback?.trim() || null },
  });
  const r = await regradeAttempt(prisma, a.id);
  await audit(req.user.id, 'ESSAY_GRADED', { targetType: 'Attempt', targetId: a.id, meta: { question: q.position + 1, score: round2(p.data.score), of: q.points, complete: r.pending === 0 }, ip: req.ip });
  res.json({ ok: true, needsGrading: r.pending > 0, score: r.score, percent: r.percent, passed: r.passed, remaining: r.pending });
});

export default router;
