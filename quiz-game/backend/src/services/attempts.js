import { gradeAttempt } from './grading.js';

export const GRACE_MS = 5000; // allowance for network delay around the deadline

export function shuffle(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Frozen copy of a bank question for one attempt (options already shuffled if requested).
export function buildSnapshot(q, rnd = Math.random) {
  let options = (q.options || []).map((o) => ({ text: o.text, imageUrl: o.imageUrl, isCorrect: o.isCorrect }));
  if (q.shuffleOptions) options = shuffle(options, rnd);
  return {
    type: q.type, text: q.text, imageUrl: q.imageUrl, imageAlt: q.imageAlt, points: q.points,
    explanation: q.explanation, category: q.category, difficulty: q.difficulty, timeLimit: q.timeLimit,
    partialScoring: q.partialScoring, caseSensitive: q.caseSensitive, matchMode: q.matchMode,
    tfAnswer: q.tfAnswer, acceptedAnswers: q.acceptedAnswers, options,
  };
}

// What a student may see DURING an attempt. Never includes correct answers or explanations.
export function sanitizeForStudent(aq) {
  const s = aq.snapshot;
  return {
    id: aq.id,
    position: aq.position,
    type: s.type,
    text: s.text,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    points: s.points,
    options: (s.options || []).map((o, i) => ({ key: String(i), text: o.text, imageUrl: o.imageUrl })),
    answer: aq.answer ?? null,
    flagged: aq.flagged,
  };
}

export function isReleased(attempt, quiz, now = new Date()) {
  if (attempt.status !== 'SUBMITTED' || attempt.needsGrading) return false;
  if (attempt.releaseState === 'RELEASED') return true;
  if (attempt.releaseState === 'HIDDEN') return false;
  if (quiz.releaseMode === 'IMMEDIATE') return true;
  if (quiz.releaseMode === 'SCHEDULED') return !!quiz.releaseAt && new Date(quiz.releaseAt) <= now;
  return false;
}

export function computeDeadline(quiz, startedAt) {
  const times = [];
  if (quiz.timeLimitMinutes) times.push(startedAt.getTime() + quiz.timeLimitMinutes * 60000);
  if (quiz.endsAt) times.push(new Date(quiz.endsAt).getTime());
  return times.length ? new Date(Math.min(...times)) : null;
}

// Submit + grade exactly once (the updateMany acts as a lock if two requests race).
export async function finalizeAttempt(prisma, attemptId, auto = false) {
  const lock = await prisma.attempt.updateMany({
    where: { id: attemptId, status: 'IN_PROGRESS' },
    data: { status: 'SUBMITTED', submittedAt: new Date(), autoSubmitted: auto },
  });
  if (lock.count === 0) return false;
  await regradeAttempt(prisma, attemptId);
  return true;
}

// Grade (or re-grade) an attempt from its saved answers. Essays that a teacher already marked keep their marks.
export async function regradeAttempt(prisma, attemptId) {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId }, include: { questions: true, quiz: true } });
  const r = gradeAttempt(attempt.questions, attempt.quiz.passPercent);
  await prisma.$transaction([
    ...r.graded.filter((g) => !g.manual).map((g) =>
      prisma.attemptQuestion.update({ where: { id: g.id }, data: { score: g.pending ? null : g.score, isCorrect: g.answered ? g.isCorrect : null } })
    ),
    prisma.attempt.update({
      where: { id: attemptId },
      data: { score: r.score, maxScore: r.maxScore, percent: r.percent, passed: r.passed, needsGrading: r.pending > 0 },
    }),
  ]);
  return r;
}

export async function expireOverdue(prisma) {
  const overdue = await prisma.attempt.findMany({
    where: { status: 'IN_PROGRESS', deadlineAt: { lt: new Date(Date.now() - GRACE_MS) } },
    select: { id: true },
    take: 200,
  });
  for (const a of overdue) await finalizeAttempt(prisma, a.id, true).catch((e) => console.error('auto-submit failed', e));
  return overdue.length;
}

// Validate and normalise an answer sent by a student. Returns {ok, value} (value may be null = cleared).
export function parseAnswer(snap, raw) {
  if (raw === null || raw === undefined) return { ok: true, value: null };
  const n = (snap.options || []).length;
  const validKey = (k) => /^\d+$/.test(String(k)) && Number(k) < n;
  switch (snap.type) {
    case 'MULTIPLE_CHOICE':
      return validKey(raw.choice) ? { ok: true, value: { choice: String(raw.choice) } } : { ok: false };
    case 'MULTIPLE_SELECT': {
      if (!Array.isArray(raw.choices) || !raw.choices.every(validKey)) return { ok: false };
      return { ok: true, value: { choices: [...new Set(raw.choices.map(String))] } };
    }
    case 'TRUE_FALSE':
      return typeof raw.value === 'boolean' ? { ok: true, value: { value: raw.value } } : { ok: false };
    case 'TEXT_INPUT':
      return typeof raw.text === 'string' && raw.text.length <= 1000 ? { ok: true, value: { text: raw.text } } : { ok: false };
    case 'ESSAY':
      return typeof raw.text === 'string' && raw.text.length <= 10000 ? { ok: true, value: { text: raw.text } } : { ok: false };
    default:
      return { ok: false };
  }
}

// Result view for a student after release. Correct answers / explanations obey the quiz settings.
export function buildResult(attempt, quiz) {
  const base = { id: attempt.id, quizTitle: quiz.title, attemptNo: attempt.attemptNo, status: attempt.status, submittedAt: attempt.submittedAt, autoSubmitted: attempt.autoSubmitted, awaitingGrading: !!attempt.needsGrading };
  if (!isReleased(attempt, quiz)) return { ...base, resultVisible: false };
  const review = [...attempt.questions].sort((a, b) => a.position - b.position).map((aq) => {
    const s = aq.snapshot;
    const item = {
      position: aq.position + 1, type: s.type, text: s.text, imageUrl: s.imageUrl, imageAlt: s.imageAlt, points: s.points,
      score: aq.score, isCorrect: aq.isCorrect, answered: aq.answer != null, yourAnswer: aq.answer ?? null,
      options: (s.options || []).map((o) => ({ text: o.text, imageUrl: o.imageUrl, ...(quiz.showCorrectAnswers ? { isCorrect: o.isCorrect } : {}) })),
    };
    if (quiz.showCorrectAnswers) {
      if (s.type === 'TRUE_FALSE') item.correctValue = s.tfAnswer;
      if (s.type === 'TEXT_INPUT') item.acceptedAnswers = s.acceptedAnswers;
    }
    if (s.type === 'ESSAY' && aq.feedback) item.feedback = aq.feedback;
    if (quiz.showExplanations && s.explanation) item.explanation = s.explanation;
    return item;
  });
  return { ...base, resultVisible: true, score: attempt.score, maxScore: attempt.maxScore, percent: attempt.percent, passed: attempt.passed, passPercent: quiz.passPercent, review };
}
