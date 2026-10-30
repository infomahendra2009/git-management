import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeAnswer, gradeAttempt } from '../src/services/grading.js';
import { buildSnapshot, sanitizeForStudent, parseAnswer, isReleased, computeDeadline, buildResult, shuffle } from '../src/services/attempts.js';

const opts = (...c) => c.map((isCorrect, i) => ({ text: `o${i}`, imageUrl: null, isCorrect }));
const snap = (o) => ({ points: 2, options: [], ...o });

test('multiple choice grading', () => {
  const s = snap({ type: 'MULTIPLE_CHOICE', options: opts(false, true, false) });
  assert.equal(gradeAnswer(s, { choice: '1' }).score, 2);
  assert.equal(gradeAnswer(s, { choice: '0' }).score, 0);
  assert.equal(gradeAnswer(s, null).answered, false);
  assert.equal(gradeAnswer(s, { choice: '9' }).answered, false);
});

test('multiple select: all-or-nothing and partial', () => {
  const o = opts(true, false, true, false);
  const strict = snap({ type: 'MULTIPLE_SELECT', options: o, partialScoring: false });
  assert.equal(gradeAnswer(strict, { choices: ['0', '2'] }).score, 2);
  assert.equal(gradeAnswer(strict, { choices: ['0'] }).score, 0);
  const partial = snap({ type: 'MULTIPLE_SELECT', options: o, partialScoring: true });
  assert.equal(gradeAnswer(partial, { choices: ['0'] }).score, 1);          // 1 of 2 right
  assert.equal(gradeAnswer(partial, { choices: ['0', '1'] }).score, 0);     // 1 right - 1 wrong
  assert.equal(gradeAnswer(partial, { choices: ['0', '2'] }).isCorrect, true);
  assert.equal(gradeAnswer(partial, { choices: ['1', '3'] }).score, 0);     // never negative
});

test('true/false and text input grading', () => {
  assert.equal(gradeAnswer(snap({ type: 'TRUE_FALSE', tfAnswer: false }), { value: false }).score, 2);
  assert.equal(gradeAnswer(snap({ type: 'TRUE_FALSE', tfAnswer: false }), { value: true }).score, 0);
  const t = snap({ type: 'TEXT_INPUT', acceptedAnswers: ['Water', 'H2O'], caseSensitive: false, matchMode: 'EXACT' });
  assert.equal(gradeAnswer(t, { text: '  water ' }).score, 2);
  assert.equal(gradeAnswer(t, { text: 'wine' }).score, 0);
  assert.equal(gradeAnswer(t, { text: '' }).answered, false);
  const cs = { ...t, caseSensitive: true };
  assert.equal(gradeAnswer(cs, { text: 'water' }).score, 0);
  const c = snap({ type: 'TEXT_INPUT', acceptedAnswers: ['photosynthesis'], matchMode: 'CONTAINS' });
  assert.equal(gradeAnswer(c, { text: 'It is Photosynthesis, I think' }).score, 2);
});

test('attempt totals and pass mark', () => {
  const qs = [
    { id: 'a', points: 2, answer: { choice: '1' }, snapshot: snap({ type: 'MULTIPLE_CHOICE', options: opts(false, true) }) },
    { id: 'b', points: 2, answer: null, snapshot: snap({ type: 'TRUE_FALSE', tfAnswer: true }) },
  ];
  const r = gradeAttempt(qs, 50);
  assert.equal(r.score, 2);
  assert.equal(r.maxScore, 4);
  assert.equal(r.percent, 50);
  assert.equal(r.passed, true);
  assert.equal(gradeAttempt(qs, 60).passed, false);
});

test('students never receive answers or explanations during an attempt', () => {
  const q = {
    type: 'MULTIPLE_SELECT', text: 'Pick', imageUrl: null, imageAlt: null, points: 1, explanation: 'SECRET-EXPLANATION',
    shuffleOptions: true, partialScoring: true, caseSensitive: false, matchMode: 'EXACT', tfAnswer: true,
    acceptedAnswers: ['SECRET-ANSWER'], options: opts(true, false, true),
  };
  const aq = { id: 'x', position: 0, snapshot: buildSnapshot(q), answer: null, flagged: false };
  const json = JSON.stringify(sanitizeForStudent(aq));
  for (const leak of ['isCorrect', 'tfAnswer', 'acceptedAnswers', 'SECRET', 'explanation', 'partialScoring']) {
    assert.ok(!json.includes(leak), `leaked ${leak}`);
  }
  // shuffled snapshot keeps the same set of options
  assert.equal(aq.snapshot.options.filter((o) => o.isCorrect).length, 2);
});

test('answer validation', () => {
  const mc = snap({ type: 'MULTIPLE_CHOICE', options: opts(true, false) });
  assert.equal(parseAnswer(mc, { choice: '1' }).ok, true);
  assert.equal(parseAnswer(mc, { choice: '5' }).ok, false);
  assert.equal(parseAnswer(mc, { choice: '../x' }).ok, false);
  assert.equal(parseAnswer(mc, null).value, null);
  const ms = snap({ type: 'MULTIPLE_SELECT', options: opts(true, false, true) });
  assert.deepEqual(parseAnswer(ms, { choices: ['0', '0', '2'] }).value, { choices: ['0', '2'] });
  assert.equal(parseAnswer(ms, { choices: 'all' }).ok, false);
  assert.equal(parseAnswer(snap({ type: 'TRUE_FALSE' }), { value: 'yes' }).ok, false);
  assert.equal(parseAnswer(snap({ type: 'TEXT_INPUT' }), { text: 'x'.repeat(1001) }).ok, false);
});

test('result release rules', () => {
  const now = new Date('2026-01-01T10:00:00Z');
  const sub = { status: 'SUBMITTED', releaseState: 'DEFAULT' };
  assert.equal(isReleased({ ...sub }, { releaseMode: 'MANUAL' }, now), false);
  assert.equal(isReleased({ ...sub }, { releaseMode: 'IMMEDIATE' }, now), true);
  assert.equal(isReleased({ ...sub }, { releaseMode: 'NEVER' }, now), false);
  assert.equal(isReleased({ ...sub }, { releaseMode: 'SCHEDULED', releaseAt: new Date('2026-01-01T09:00:00Z') }, now), true);
  assert.equal(isReleased({ ...sub }, { releaseMode: 'SCHEDULED', releaseAt: new Date('2026-01-02T09:00:00Z') }, now), false);
  assert.equal(isReleased({ ...sub, releaseState: 'RELEASED' }, { releaseMode: 'NEVER' }, now), true);
  assert.equal(isReleased({ ...sub, releaseState: 'HIDDEN' }, { releaseMode: 'IMMEDIATE' }, now), false);
  assert.equal(isReleased({ status: 'IN_PROGRESS', releaseState: 'RELEASED' }, { releaseMode: 'IMMEDIATE' }, now), false);
});

test('hidden results expose nothing; released results obey show-answer settings', () => {
  const quiz = { title: 'T', releaseMode: 'MANUAL', passPercent: 50, showCorrectAnswers: false, showExplanations: false };
  const aq = { id: 'x', position: 0, answer: { choice: '0' }, score: 2, isCorrect: true, snapshot: snap({ type: 'MULTIPLE_CHOICE', explanation: 'WHY', options: opts(true, false) }) };
  const attempt = { id: 'a', status: 'SUBMITTED', releaseState: 'DEFAULT', attemptNo: 1, score: 2, maxScore: 2, percent: 100, passed: true, questions: [aq] };
  const hidden = buildResult(attempt, quiz);
  assert.equal(hidden.resultVisible, false);
  assert.ok(!('score' in hidden));
  const shown = buildResult({ ...attempt, releaseState: 'RELEASED' }, quiz);
  assert.equal(shown.score, 2);
  assert.ok(!JSON.stringify(shown).includes('WHY'));
  assert.ok(!JSON.stringify(shown).includes('isCorrect":false'));
  const full = buildResult({ ...attempt, releaseState: 'RELEASED' }, { ...quiz, showCorrectAnswers: true, showExplanations: true });
  assert.equal(full.review[0].explanation, 'WHY');
  assert.equal(full.review[0].options[0].isCorrect, true);
});

test('deadline is the earlier of time limit and closing time', () => {
  const start = new Date('2026-01-01T10:00:00Z');
  assert.equal(computeDeadline({ timeLimitMinutes: null, endsAt: null }, start), null);
  assert.equal(computeDeadline({ timeLimitMinutes: 30, endsAt: null }, start).toISOString(), '2026-01-01T10:30:00.000Z');
  assert.equal(computeDeadline({ timeLimitMinutes: 30, endsAt: new Date('2026-01-01T10:10:00Z') }, start).toISOString(), '2026-01-01T10:10:00.000Z');
  assert.equal(shuffle([1, 2, 3, 4, 5]).length, 5);
});
