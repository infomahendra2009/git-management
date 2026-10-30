const round2 = (x) => Math.round(x * 100) / 100;
const norm = (s, cs) => {
  const t = String(s ?? '').trim().replace(/\s+/g, ' ');
  return cs ? t : t.toLowerCase();
};

// snap: frozen question (options in display order). answer: what the student sent.
export function gradeAnswer(snap, answer) {
  const none = { score: 0, isCorrect: false, answered: false };
  if (answer === null || answer === undefined) return none;
  const points = snap.points;
  const opts = snap.options || [];

  if (snap.type === 'MULTIPLE_CHOICE') {
    const o = opts[Number(answer.choice)];
    if (answer.choice === undefined || !o) return none;
    return { score: o.isCorrect ? points : 0, isCorrect: !!o.isCorrect, answered: true };
  }

  if (snap.type === 'MULTIPLE_SELECT') {
    const sel = new Set((answer.choices || []).map(Number).filter((n) => Number.isInteger(n) && opts[n]));
    if (!sel.size) return none;
    const totalCorrect = opts.filter((o) => o.isCorrect).length;
    const right = [...sel].filter((i) => opts[i].isCorrect).length;
    const wrong = sel.size - right;
    const exact = right === totalCorrect && wrong === 0;
    let score = exact ? points : 0;
    if (!exact && snap.partialScoring && totalCorrect > 0) score = points * Math.max(0, (right - wrong) / totalCorrect);
    return { score: round2(score), isCorrect: exact, answered: true };
  }

  if (snap.type === 'TRUE_FALSE') {
    if (typeof answer.value !== 'boolean') return none;
    const ok = answer.value === snap.tfAnswer;
    return { score: ok ? points : 0, isCorrect: ok, answered: true };
  }

  if (snap.type === 'TEXT_INPUT') {
    const cs = !!snap.caseSensitive;
    const t = norm(answer.text, cs);
    if (!t) return none;
    const accepted = (snap.acceptedAnswers || []).map((a) => norm(a, cs)).filter(Boolean);
    const ok = snap.matchMode === 'CONTAINS' ? accepted.some((a) => t.includes(a)) : accepted.includes(t);
    return { score: ok ? points : 0, isCorrect: ok, answered: true };
  }
  if (snap.type === 'ESSAY') {
    // Needs a teacher. The score is set manually later (see routes/grading.js).
    const has = String(answer.text ?? '').trim() !== '';
    return has ? { score: 0, isCorrect: null, answered: true, pending: true } : { score: 0, isCorrect: null, answered: false };
  }
  return none;
}

export function gradeAttempt(questions, passPercent) {
  let score = 0;
  let maxScore = 0;
  let pending = 0;
  const graded = questions.map((q) => {
    let g = gradeAnswer(q.snapshot, q.answer);
    if (q.snapshot.type === 'ESSAY' && g.pending && q.gradedAt) {
      g = { score: q.score || 0, isCorrect: null, answered: true, manual: true }; // already marked by a teacher
    }
    if (g.pending) pending++;
    else score += g.score;
    maxScore += q.points;
    return { id: q.id, ...g };
  });
  // While essays wait for marking there is no total yet.
  if (pending > 0) return { graded, score: null, maxScore: round2(maxScore), percent: null, passed: null, pending };
  score = round2(score);
  const percent = maxScore > 0 ? round2((score / maxScore) * 100) : 0;
  return { graded, score, maxScore: round2(maxScore), percent, passed: percent >= passPercent, pending: 0 };
}
