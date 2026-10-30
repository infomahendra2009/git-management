// Pure report calculations (no database access) so they are easy to test.
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const timeTaken = (a) =>
  a.submittedAt && a.startedAt ? Math.max(0, Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 1000)) : null;
const cap = (s) => (s ? s[0] + s.slice(1).toLowerCase() : s);

export const BASES = ['best', 'latest', 'first', 'all'];

// Which attempt counts when a student attempted a quiz more than once.
export function pickAttempts(attempts, basis = 'best') {
  const done = attempts.filter((a) => a.status === 'SUBMITTED' && a.percent !== null && a.percent !== undefined);
  if (basis === 'all') return done;
  const byStudent = new Map();
  for (const a of done) {
    const cur = byStudent.get(a.studentId);
    const better =
      !cur ||
      (basis === 'best' && (a.percent > cur.percent || (a.percent === cur.percent && a.attemptNo < cur.attemptNo))) ||
      (basis === 'latest' && a.attemptNo > cur.attemptNo) ||
      (basis === 'first' && a.attemptNo < cur.attemptNo);
    if (better) byStudent.set(a.studentId, a);
  }
  return [...byStudent.values()];
}

export function summarize(list) {
  const n = list.length;
  const pct = list.map((a) => a.percent);
  const times = list.map(timeTaken).filter((t) => t !== null);
  const distribution = Array.from({ length: 10 }, (_, i) => ({ label: i === 9 ? '90–100' : `${i * 10}–${i * 10 + 9}`, count: 0 }));
  pct.forEach((p) => { distribution[Math.min(9, Math.max(0, Math.floor(p / 10)))].count++; });
  return {
    summary: {
      count: n,
      avgPercent: n ? r1(mean(pct)) : null,
      medianPercent: n ? r1(median(pct)) : null,
      highest: n ? Math.max(...pct) : null,
      lowest: n ? Math.min(...pct) : null,
      passCount: list.filter((a) => a.passed).length,
      passRate: n ? r1((list.filter((a) => a.passed).length / n) * 100) : null,
      avgTimeSeconds: times.length ? Math.round(mean(times)) : null,
    },
    distribution,
  };
}

const top = (map, n = 3) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([answer, count]) => ({ answer, count }));

// Per-question statistics. Groups by the bank question id (attempt order may be shuffled).
export function questionAnalysis(attemptQuestions) {
  const map = new Map();
  for (const aq of attemptQuestions) {
    const s = aq.snapshot;
    const key = aq.questionId || `${s.type}:${s.text}`;
    let e = map.get(key);
    if (!e) {
      e = { questionId: aq.questionId, text: s.text || '(image question)', type: s.type, category: s.category || null, difficulty: s.difficulty || null, points: s.points, attempts: 0, answered: 0, correct: 0, scoreSum: 0, timeSum: 0, wrong: new Map(), options: new Map() };
      map.set(key, e);
    }
    e.attempts++;
    e.timeSum += aq.spentSeconds || 0;
    e.scoreSum += aq.score || 0;
    if (aq.answer !== null && aq.answer !== undefined) e.answered++;
    if (aq.isCorrect) e.correct++;

    const a = aq.answer;
    if (!a) continue;
    const tally = (label, isCorrect) => {
      const o = e.options.get(label) || { count: 0, isCorrect };
      o.count++;
      e.options.set(label, o);
      if (!isCorrect) e.wrong.set(label, (e.wrong.get(label) || 0) + 1);
    };
    if (s.type === 'MULTIPLE_CHOICE') {
      const o = s.options[Number(a.choice)];
      if (o) tally(o.text || '(image)', o.isCorrect);
    } else if (s.type === 'MULTIPLE_SELECT') {
      (a.choices || []).forEach((c) => { const o = s.options[Number(c)]; if (o) tally(o.text || '(image)', o.isCorrect); });
    } else if (s.type === 'TRUE_FALSE') {
      if (typeof a.value === 'boolean') tally(a.value ? 'True' : 'False', a.value === s.tfAnswer);
    } else if (s.type === 'TEXT_INPUT') {
      const t = String(a.text || '').trim().toLowerCase().slice(0, 80);
      if (t && !aq.isCorrect) e.wrong.set(t, (e.wrong.get(t) || 0) + 1);
    }
  }
  return [...map.values()]
    .map((e) => ({
      questionId: e.questionId, text: e.text, type: e.type, category: e.category, difficulty: e.difficulty, points: e.points,
      attempts: e.attempts, answered: e.answered, correct: e.correct,
      // Essays have no right/wrong, so show the average mark as a percentage of the points
      percentCorrect: e.type === 'ESSAY' ? (e.attempts && e.points ? r1((e.scoreSum / e.attempts / e.points) * 100) : 0) : e.attempts ? r1((e.correct / e.attempts) * 100) : 0,
      avgScore: e.attempts ? r2(e.scoreSum / e.attempts) : 0,
      avgTimeSeconds: e.attempts ? Math.round(e.timeSum / e.attempts) : 0,
      topWrong: top(e.wrong),
      options: [...e.options.entries()].map(([label, o]) => ({ label, count: o.count, isCorrect: o.isCorrect })),
    }))
    .sort((a, b) => a.percentCorrect - b.percentCorrect); // hardest first
}

// Group score by a snapshot field (category / difficulty).
export function groupPerformance(attemptQuestions, field, fallback) {
  const map = new Map();
  for (const aq of attemptQuestions) {
    let name = aq.snapshot[field] || fallback;
    if (field === 'difficulty' && aq.snapshot[field]) name = cap(aq.snapshot[field]);
    const e = map.get(name) || { name, earned: 0, max: 0, questions: 0 };
    e.earned += aq.score || 0;
    e.max += aq.points || 0;
    e.questions++;
    map.set(name, e);
  }
  return [...map.values()]
    .map((e) => ({ ...e, earned: r2(e.earned), max: r2(e.max), percent: e.max > 0 ? r1((e.earned / e.max) * 100) : 0 }))
    .sort((a, b) => b.percent - a.percent);
}

export const attemptRow = (a) => ({
  attemptId: a.id, studentId: a.studentId, student: a.student?.name, userCode: a.student?.userCode, attemptNo: a.attemptNo,
  score: a.score, maxScore: a.maxScore, percent: a.percent, passed: a.passed, submittedAt: a.submittedAt,
  timeTakenSeconds: timeTaken(a), autoSubmitted: a.autoSubmitted, releaseState: a.releaseState,
});

export function buildQuizReport({ quiz, attempts, assigned, basis = 'best' }) {
  const submitted = attempts.filter((a) => a.status === 'SUBMITTED' && a.percent !== null);
  const picked = pickAttempts(submitted, basis);
  const { summary, distribution } = summarize(picked);
  const attemptedStudents = new Set(submitted.map((a) => a.studentId)).size;
  const aqs = picked.flatMap((a) => a.questions || []);
  return {
    quiz: { id: quiz.id, title: quiz.title, passPercent: quiz.passPercent, status: quiz.status },
    basis,
    summary: {
      ...summary, assigned, attemptedStudents, totalAttempts: submitted.length,
      inProgress: attempts.filter((a) => a.status === 'IN_PROGRESS').length,
      awaitingGrading: attempts.filter((a) => a.status === 'SUBMITTED' && a.percent === null).length,
      completionRate: assigned ? r1((attemptedStudents / assigned) * 100) : null,
    },
    distribution,
    results: picked.map(attemptRow).sort((a, b) => b.percent - a.percent),
    questions: questionAnalysis(aqs),
    categories: groupPerformance(aqs, 'category', 'Uncategorised'),
    difficulty: groupPerformance(aqs, 'difficulty', 'Unspecified'),
  };
}

// attempts: submitted attempts with {quiz:{id,title}, questions}. Used for staff view and for a student's own "My results".
export function buildStudentReport({ student, attempts }) {
  const done = attempts.filter((a) => a.status === 'SUBMITTED' && a.percent !== null).sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  const pct = done.map((a) => a.percent);
  const aqs = done.flatMap((a) => a.questions || []);
  const categories = groupPerformance(aqs, 'category', 'Uncategorised');
  return {
    student,
    summary: {
      attempts: done.length,
      quizzes: new Set(done.map((a) => a.quizId)).size,
      avgPercent: done.length ? r1(mean(pct)) : null,
      best: done.length ? Math.max(...pct) : null,
      latest: done.length ? pct[pct.length - 1] : null,
      passedCount: done.filter((a) => a.passed).length,
    },
    trend: done.map((a) => ({ date: a.submittedAt, quizTitle: a.quiz.title, percent: a.percent, passed: a.passed })),
    attempts: [...done].reverse().map((a) => ({
      id: a.id, quizId: a.quizId, quizTitle: a.quiz.title, attemptNo: a.attemptNo, submittedAt: a.submittedAt,
      score: a.score, maxScore: a.maxScore, percent: a.percent, passed: a.passed, timeTakenSeconds: timeTaken(a),
    })),
    categories,
    difficulty: groupPerformance(aqs, 'difficulty', 'Unspecified'),
    ...strengthsWeaknesses(categories),
  };
}

// Needs at least 2 topics to compare. Strong = 70%+, needs work = under 60%.
export function strengthsWeaknesses(categories) {
  if (categories.length < 2) return { strengths: [], weaknesses: [] };
  const sorted = [...categories].sort((a, b) => b.percent - a.percent);
  return {
    strengths: sorted.filter((c) => c.percent >= 70).slice(0, 3).map((c) => c.name),
    weaknesses: [...sorted].reverse().filter((c) => c.percent < 60).slice(0, 3).map((c) => c.name),
  };
}

// Students x quizzes grid using each student's best attempt per quiz.
export function buildClassReport({ klass, students, quizzes, attempts }) {
  const best = new Map(); // `${studentId}:${quizId}` -> attempt
  for (const a of attempts.filter((x) => x.status === 'SUBMITTED' && x.percent !== null)) {
    const k = `${a.studentId}:${a.quizId}`;
    const cur = best.get(k);
    if (!cur || a.percent > cur.percent) best.set(k, a);
  }
  const rows = students.map((s) => {
    const cells = {};
    const vals = [];
    for (const q of quizzes) {
      const a = best.get(`${s.id}:${q.id}`);
      cells[q.id] = a ? { percent: a.percent, passed: a.passed } : null;
      if (a) vals.push(a.percent);
    }
    return { id: s.id, name: s.name, userCode: s.userCode, cells, avgPercent: vals.length ? r1(mean(vals)) : null, completed: vals.length };
  });
  const quizStats = quizzes.map((q) => {
    const got = rows.map((r) => r.cells[q.id]).filter(Boolean);
    return {
      quizId: q.id, title: q.title, assigned: students.length, attempted: got.length,
      avgPercent: got.length ? r1(mean(got.map((c) => c.percent))) : null,
      passRate: got.length ? r1((got.filter((c) => c.passed).length / got.length) * 100) : null,
    };
  });
  return { class: klass, quizzes: quizzes.map((q) => ({ id: q.id, title: q.title })), students: rows.sort((a, b) => a.name.localeCompare(b.name)), quizStats };
}
