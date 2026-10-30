import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isReleased } from '../services/attempts.js';
import { audit } from '../services/audit.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'TEACHER'));
const scope = (req) => (req.user.role === 'ADMIN' ? {} : { ownerId: req.user.id });

const nullable = (schema) => z.preprocess((v) => (v === '' || v === undefined ? null : v), schema.nullable());
const settingsSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().max(5000).nullish().transform((v) => v || null),
    passPercent: z.coerce.number().min(0).max(100),
    timeLimitMinutes: nullable(z.coerce.number().int().min(1).max(1440)),
    attemptsAllowed: z.coerce.number().int().min(1).max(20),
    questionOrder: z.enum(['SEQUENTIAL', 'RANDOM']),
    oneAtATime: z.boolean(),
    showProgress: z.boolean(),
    allowReview: z.boolean(),
    releaseMode: z.enum(['IMMEDIATE', 'MANUAL', 'SCHEDULED', 'NEVER']),
    releaseAt: nullable(z.coerce.date()),
    showCorrectAnswers: z.boolean(),
    showExplanations: z.boolean(),
    startsAt: nullable(z.coerce.date()),
    endsAt: nullable(z.coerce.date()),
  })
  .superRefine((v, ctx) => {
    if (v.releaseMode === 'SCHEDULED' && !v.releaseAt) ctx.addIssue({ code: 'custom', message: 'Choose a release date and time for scheduled release' });
    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt) ctx.addIssue({ code: 'custom', message: 'Closing time must be after the opening time' });
  });

const firstError = (p) => p.error.issues[0]?.message || 'Invalid input';

async function owned(req, include) {
  return prisma.quiz.findFirst({ where: { id: req.params.id, ...scope(req) }, include });
}

router.get('/', async (req, res) => {
  const rows = await prisma.quiz.findMany({
    where: scope(req), orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true, attempts: true } }, owner: { select: { name: true } } },
  });
  res.json({ quizzes: rows.map((q) => ({ id: q.id, title: q.title, status: q.status, questions: q._count.questions, attempts: q._count.attempts, owner: q.owner.name, createdAt: q.createdAt })) });
});

router.post('/', async (req, res) => {
  const p = settingsSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: firstError(p) });
  const quiz = await prisma.quiz.create({ data: { ...p.data, ownerId: req.user.id } });
  res.status(201).json({ quiz });
});

router.get('/:id', async (req, res) => {
  const quiz = await owned(req, {
    questions: { orderBy: { position: 'asc' }, include: { question: { select: { id: true, text: true, type: true, points: true, category: true, imageUrl: true } } } },
    assignments: true,
    _count: { select: { attempts: true } },
  });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const { questions, assignments, _count, ...settings } = quiz;
  const qs = questions.map((x) => ({ ...x.question, text: x.question.text.slice(0, 160) }));
  res.json({
    quiz: settings,
    questions: qs,
    totalPoints: qs.reduce((s, q) => s + q.points, 0),
    assignments: { classIds: assignments.filter((a) => a.classId).map((a) => a.classId), studentIds: assignments.filter((a) => a.studentId).map((a) => a.studentId) },
    attemptCount: _count.attempts,
  });
});

router.put('/:id', async (req, res) => {
  const p = settingsSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: firstError(p) });
  if (!(await owned(req))) return res.status(404).json({ error: 'Quiz not found' });
  const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data: p.data });
  res.json({ quiz });
});

router.delete('/:id', async (req, res) => {
  const quiz = await owned(req, { _count: { select: { attempts: true } } });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  if (quiz._count.attempts > 0) return res.status(409).json({ error: 'This quiz has attempts and cannot be deleted. Unpublish it instead.' });
  await prisma.quiz.delete({ where: { id: quiz.id } });
  await audit(req.user.id, 'QUIZ_DELETED', { targetType: 'Quiz', targetId: quiz.id, meta: { title: quiz.title } });
  res.json({ ok: true });
});

// Replace the ordered question list. Locked once students have attempted the quiz.
router.put('/:id/questions', async (req, res) => {
  const p = z.object({ questionIds: z.array(z.string().length(36)).max(200) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid question list' });
  const quiz = await owned(req, { _count: { select: { attempts: true } } });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  if (quiz._count.attempts > 0) return res.status(409).json({ error: 'Questions are locked because students have already attempted this quiz' });
  const ids = [...new Set(p.data.questionIds)];
  const found = await prisma.question.findMany({ where: { id: { in: ids }, ...scope(req) }, select: { id: true } });
  if (found.length !== ids.length) return res.status(400).json({ error: 'Some questions were not found in your question bank' });
  await prisma.$transaction([
    prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } }),
    prisma.quizQuestion.createMany({ data: ids.map((questionId, position) => ({ quizId: quiz.id, questionId, position })) }),
  ]);
  res.json({ ok: true, count: ids.length });
});

router.put('/:id/assignments', async (req, res) => {
  const p = z.object({ classIds: z.array(z.string().length(36)).max(500), studentIds: z.array(z.string().length(36)).max(5000) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid assignment list' });
  if (!(await owned(req))) return res.status(404).json({ error: 'Quiz not found' });
  const classes = await prisma.class.findMany({ where: { id: { in: p.data.classIds }, ...scope(req) }, select: { id: true } });
  const students = await prisma.user.findMany({ where: { id: { in: p.data.studentIds }, role: 'STUDENT' }, select: { id: true } });
  await prisma.$transaction([
    prisma.quizAssignment.deleteMany({ where: { quizId: req.params.id } }),
    prisma.quizAssignment.createMany({
      data: [...classes.map((c) => ({ quizId: req.params.id, classId: c.id })), ...students.map((s) => ({ quizId: req.params.id, studentId: s.id }))],
    }),
  ]);
  res.json({ ok: true, classes: classes.length, students: students.length });
});

router.post('/:id/publish', async (req, res) => {
  const quiz = await owned(req, { questions: { include: { question: { select: { points: true } } } } });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  if (quiz.questions.length < 1) return res.status(400).json({ error: 'Add at least one question before publishing' });
  if (quiz.questions.reduce((s, x) => s + x.question.points, 0) <= 0) return res.status(400).json({ error: 'Total points must be positive' });
  await prisma.quiz.update({ where: { id: quiz.id }, data: { status: 'PUBLISHED' } });
  await audit(req.user.id, 'QUIZ_PUBLISHED', { targetType: 'Quiz', targetId: quiz.id, meta: { title: quiz.title } });
  res.json({ ok: true, status: 'PUBLISHED' });
});

router.post('/:id/unpublish', async (req, res) => {
  if (!(await owned(req))) return res.status(404).json({ error: 'Quiz not found' });
  await prisma.quiz.update({ where: { id: req.params.id }, data: { status: 'DRAFT' } });
  await audit(req.user.id, 'QUIZ_UNPUBLISHED', { targetType: 'Quiz', targetId: req.params.id });
  res.json({ ok: true, status: 'DRAFT' });
});

router.post('/:id/clone', async (req, res) => {
  const src = await owned(req, { questions: true, assignments: true });
  if (!src) return res.status(404).json({ error: 'Quiz not found' });
  const { id, createdAt, updatedAt, questions, assignments, status, ownerId, ...settings } = src;
  const copy = await prisma.quiz.create({
    data: {
      ...settings, title: `${src.title} (copy)`, ownerId: req.user.id, status: 'DRAFT',
      questions: { create: questions.map((x) => ({ questionId: x.questionId, position: x.position })) },
      assignments: { create: assignments.map((a) => ({ classId: a.classId, studentId: a.studentId })) },
    },
  });
  res.status(201).json({ quiz: copy });
});

// ---- attempts list + result release control ----
router.get('/:id/attempts', async (req, res) => {
  const quiz = await owned(req);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const rows = await prisma.attempt.findMany({
    where: { quizId: quiz.id }, orderBy: [{ startedAt: 'desc' }],
    include: { student: { select: { name: true, userCode: true } } },
  });
  res.json({
    releaseMode: quiz.releaseMode,
    attempts: rows.map((a) => ({
      id: a.id, student: a.student.name, userCode: a.student.userCode, attemptNo: a.attemptNo, status: a.status,
      startedAt: a.startedAt, submittedAt: a.submittedAt, autoSubmitted: a.autoSubmitted,
      score: a.score, maxScore: a.maxScore, percent: a.percent, passed: a.passed,
      releaseState: a.releaseState, needsGrading: a.needsGrading, visibleToStudent: isReleased(a, quiz),
    })),
  });
});

router.post('/:id/release', async (req, res) => {
  const p = z.object({ state: z.enum(['RELEASED', 'HIDDEN', 'DEFAULT']), attemptIds: z.array(z.string().length(36)).max(5000).optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid request' });
  if (!(await owned(req))) return res.status(404).json({ error: 'Quiz not found' });
  const where = { quizId: req.params.id, status: 'SUBMITTED', ...(p.data.attemptIds ? { id: { in: p.data.attemptIds } } : {}) };
  const r = await prisma.attempt.updateMany({ where, data: { releaseState: p.data.state } });
  await prisma.auditLog.create({ data: { actorId: req.user.id, action: 'RESULT_RELEASE', targetType: 'Quiz', targetId: req.params.id, meta: { state: p.data.state, count: r.count, scope: p.data.attemptIds ? 'selected' : 'all' } } });
  res.json({ ok: true, updated: r.count });
});

export default router;
