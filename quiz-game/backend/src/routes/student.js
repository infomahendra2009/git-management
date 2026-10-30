import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { buildStudentReport } from '../services/reports.js';
import {
  GRACE_MS, shuffle, buildSnapshot, sanitizeForStudent, computeDeadline, finalizeAttempt, parseAnswer, buildResult, isReleased,
} from '../services/attempts.js';

const router = Router();
router.use(requireAuth, requireRole('STUDENT'));

async function eligibleQuizWhere(studentId) {
  const classIds = (await prisma.classMember.findMany({ where: { studentId }, select: { classId: true } })).map((m) => m.classId);
  return { status: 'PUBLISHED', assignments: { some: { OR: [{ studentId }, ...(classIds.length ? [{ classId: { in: classIds } }] : [])] } } };
}

const windowState = (quiz, now = new Date()) => {
  if (quiz.startsAt && now < quiz.startsAt) return 'UPCOMING';
  if (quiz.endsAt && now > quiz.endsAt) return 'CLOSED';
  return 'OPEN';
};

router.get('/quizzes', async (req, res) => {
  const quizzes = await prisma.quiz.findMany({
    where: await eligibleQuizWhere(req.user.id), orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true } } },
  });
  const attempts = await prisma.attempt.findMany({ where: { studentId: req.user.id, quizId: { in: quizzes.map((q) => q.id) } }, orderBy: { attemptNo: 'asc' } });
  const out = quizzes.map((q) => {
    const mine = attempts.filter((a) => a.quizId === q.id);
    const inProgress = mine.find((a) => a.status === 'IN_PROGRESS');
    const w = windowState(q);
    const attemptsLeft = Math.max(0, q.attemptsAllowed - mine.length);
    return {
      id: q.id, title: q.title, description: q.description, questions: q._count.questions, timeLimitMinutes: q.timeLimitMinutes,
      attemptsAllowed: q.attemptsAllowed, attemptsUsed: mine.length, startsAt: q.startsAt, endsAt: q.endsAt, window: w,
      inProgressAttemptId: inProgress?.id || null,
      canStart: !inProgress && w === 'OPEN' && attemptsLeft > 0,
      submitted: mine.filter((a) => a.status === 'SUBMITTED').map((a) => {
        const visible = isReleased(a, q);
        return { id: a.id, attemptNo: a.attemptNo, submittedAt: a.submittedAt, awaitingGrading: a.needsGrading, resultVisible: visible, ...(visible ? { score: a.score, maxScore: a.maxScore, percent: a.percent, passed: a.passed } : {}) };
      }),
    };
  });
  res.json({ quizzes: out });
});

router.post('/quizzes/:id/start', async (req, res) => {
  const where = { ...(await eligibleQuizWhere(req.user.id)), id: req.params.id };
  const quiz = await prisma.quiz.findFirst({ where, include: { questions: { orderBy: { position: 'asc' }, include: { question: { include: { options: { orderBy: { position: 'asc' } } } } } } } });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const existing = await prisma.attempt.findFirst({ where: { quizId: quiz.id, studentId: req.user.id, status: 'IN_PROGRESS' } });
  if (existing) return res.json({ attemptId: existing.id, resumed: true });

  const w = windowState(quiz);
  if (w === 'UPCOMING') return res.status(409).json({ error: 'This quiz has not opened yet' });
  if (w === 'CLOSED') return res.status(409).json({ error: 'This quiz is closed' });
  const used = await prisma.attempt.count({ where: { quizId: quiz.id, studentId: req.user.id } });
  if (used >= quiz.attemptsAllowed) return res.status(409).json({ error: 'No attempts left for this quiz' });
  if (quiz.questions.length === 0) return res.status(409).json({ error: 'This quiz has no questions' });

  let list = quiz.questions.map((x) => x.question);
  if (quiz.questionOrder === 'RANDOM') list = shuffle(list);
  const startedAt = new Date();
  try {
    const attempt = await prisma.attempt.create({
      data: {
        quizId: quiz.id, studentId: req.user.id, attemptNo: used + 1, startedAt, deadlineAt: computeDeadline(quiz, startedAt),
        questions: { create: list.map((q, position) => ({ position, questionId: q.id, snapshot: buildSnapshot(q), points: q.points })) },
      },
    });
    res.status(201).json({ attemptId: attempt.id });
  } catch (e) {
    if (e.code === 'P2002') { // two clicks at once: return the attempt that won
      const a = await prisma.attempt.findFirst({ where: { quizId: quiz.id, studentId: req.user.id, status: 'IN_PROGRESS' } });
      if (a) return res.json({ attemptId: a.id, resumed: true });
    }
    throw e;
  }
});

// My results: only attempts the teacher/admin has released. Hidden attempts never count here.
router.get('/results', async (req, res) => {
  const attempts = await prisma.attempt.findMany({
    where: { studentId: req.user.id, status: 'SUBMITTED' },
    include: { quiz: true, questions: true },
  });
  const released = attempts.filter((a) => isReleased(a, a.quiz));
  const report = buildStudentReport({
    student: { id: req.user.id, name: req.user.name, userCode: req.user.userCode },
    attempts: released.map((a) => ({ ...a, quiz: { id: a.quiz.id, title: a.quiz.title, passPercent: a.quiz.passPercent } })),
  });
  res.json({ ...report, awaitingRelease: attempts.length - released.length });
});

async function loadAttempt(req) {
  const a = await prisma.attempt.findFirst({ where: { id: req.params.id, studentId: req.user.id }, include: { quiz: true } });
  if (!a) return null;
  if (a.status === 'IN_PROGRESS' && a.deadlineAt && Date.now() > a.deadlineAt.getTime() + GRACE_MS) {
    await finalizeAttempt(prisma, a.id, true);
    return prisma.attempt.findFirst({ where: { id: a.id }, include: { quiz: true } });
  }
  return a;
}

async function attemptPayload(a) {
  const questions = await prisma.attemptQuestion.findMany({ where: { attemptId: a.id }, orderBy: { position: 'asc' } });
  if (a.status === 'IN_PROGRESS') {
    return {
      status: 'IN_PROGRESS', serverNow: new Date(), deadlineAt: a.deadlineAt,
      quiz: { title: a.quiz.title, oneAtATime: a.quiz.oneAtATime, showProgress: a.quiz.showProgress, allowReview: a.quiz.allowReview },
      questions: questions.map(sanitizeForStudent),
    };
  }
  return buildResult({ ...a, questions }, a.quiz);
}

router.get('/attempts/:id', async (req, res) => {
  const a = await loadAttempt(req);
  if (!a) return res.status(404).json({ error: 'Attempt not found' });
  res.json(await attemptPayload(a));
});

router.put('/attempts/:id/answers/:qid', async (req, res) => {
  const a = await loadAttempt(req);
  if (!a) return res.status(404).json({ error: 'Attempt not found' });
  if (a.status !== 'IN_PROGRESS') return res.status(409).json({ error: 'This attempt has already been submitted', submitted: true });
  const aq = await prisma.attemptQuestion.findFirst({ where: { id: req.params.qid, attemptId: a.id } });
  if (!aq) return res.status(404).json({ error: 'Question not found' });

  const data = {};
  if ('answer' in (req.body || {})) {
    const parsed = parseAnswer(aq.snapshot, req.body.answer);
    if (!parsed.ok) return res.status(400).json({ error: 'Invalid answer' });
    data.answer = parsed.value === null ? Prisma.DbNull : parsed.value;
  }
  if (typeof req.body?.flagged === 'boolean') data.flagged = req.body.flagged;
  const spent = Math.min(600, Math.max(0, Math.floor(Number(req.body?.spent) || 0)));
  if (spent) data.spentSeconds = { increment: spent };
  if (Object.keys(data).length) await prisma.attemptQuestion.update({ where: { id: aq.id }, data });
  res.json({ ok: true, serverNow: new Date() });
});

router.post('/attempts/:id/submit', async (req, res) => {
  const a = await loadAttempt(req);
  if (!a) return res.status(404).json({ error: 'Attempt not found' });
  if (a.status === 'IN_PROGRESS') await finalizeAttempt(prisma, a.id, false);
  const fresh = await prisma.attempt.findFirst({ where: { id: a.id }, include: { quiz: true } });
  res.json(await attemptPayload(fresh));
});

export default router;
