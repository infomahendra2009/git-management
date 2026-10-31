import test from 'node:test';
import assert from 'node:assert/strict';
import { createMessenger, toE164, renderMessage } from '../src/services/messaging.js';
import { assertSafeConfig } from '../src/config.js';
import { isLocked, nextFailureState } from '../src/services/lockout.js';
import { gradeAnswer, gradeAttempt } from '../src/services/grading.js';
import { parseAnswer, isReleased, buildResult } from '../src/services/attempts.js';
import { validateQuestion } from '../src/services/questionSchema.js';
import { parseCsv, analyze, buildTemplate } from '../src/services/importer.js';
import { questionAnalysis, buildQuizReport } from '../src/services/reports.js';

const baseCfg = (over = {}) => ({
  otp: { smsProvider: 'console', emailProvider: 'console', ...(over.otp || {}) },
  smtp: { host: '', port: 587, secure: false, user: '', pass: '', from: 'Quiz <no-reply@x.com>', ...(over.smtp || {}) },
  sms: {
    defaultCountryCode: '91',
    twilio: { sid: 'AC123', token: 'tok', from: '+15550001' },
    msg91: { authKey: 'KEY', templateId: 'TPL1' },
    http: { url: 'https://gw.example/send', method: 'POST', headers: '{"X-Key":"abc"}', body: '{"to":"{{phone}}","text":"{{message}}"}' },
    ...(over.sms || {}),
  },
});
const mockFetch = (status = 200) => { const calls = []; const f = async (url, opts) => { calls.push({ url, opts }); return { ok: status < 400, status, text: async () => 'gateway said no' }; }; f.calls = calls; return f; };

test('phone numbers and message templates', () => {
  assert.equal(toE164('+91 98765-43210'), '+919876543210');
  assert.equal(toE164('9876543210'), '+919876543210');
  assert.equal(toE164('9876543210', '44'), '+449876543210');
  assert.equal(renderMessage('Code {{code}} for {{app}}', { code: '123456', app: 'Q' }), 'Code 123456 for Q');
  assert.equal(renderMessage('{{missing}}!', {}), '!');
});

test('Twilio request is built correctly', async () => {
  const f = mockFetch();
  const m = createMessenger(baseCfg({ otp: { smsProvider: 'twilio' } }), { fetch: f });
  await m.sendSms('9876543210', 'Hello', { code: '1' });
  const { url, opts } = f.calls[0];
  assert.equal(url, 'https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json');
  assert.equal(opts.headers.Authorization, `Basic ${Buffer.from('AC123:tok').toString('base64')}`);
  const body = new URLSearchParams(opts.body);
  assert.equal(body.get('To'), '+919876543210');
  assert.equal(body.get('From'), '+15550001');
  assert.equal(body.get('Body'), 'Hello');
});

test('MSG91 request uses the OTP template and a number without +', async () => {
  const f = mockFetch();
  await createMessenger(baseCfg({ otp: { smsProvider: 'msg91' } }), { fetch: f }).sendSms('+919876543210', 'ignored', { code: '482913' });
  const u = new URL(f.calls[0].url);
  assert.equal(u.origin + u.pathname, 'https://control.msg91.com/api/v5/otp');
  assert.equal(u.searchParams.get('template_id'), 'TPL1');
  assert.equal(u.searchParams.get('mobile'), '919876543210');
  assert.equal(u.searchParams.get('otp'), '482913');
  assert.equal(f.calls[0].opts.headers.authkey, 'KEY');
});

test('generic HTTP gateway: placeholders are JSON-escaped', async () => {
  const f = mockFetch();
  await createMessenger(baseCfg({ otp: { smsProvider: 'http' } }), { fetch: f }).sendSms('9876543210', 'He said "hi"\nbye', { code: '1' });
  const { opts } = f.calls[0];
  const parsed = JSON.parse(opts.body); // would throw if the quote or newline were not escaped
  assert.equal(parsed.to, '+919876543210');
  assert.equal(parsed.text, 'He said "hi"\nbye');
  assert.equal(opts.headers['X-Key'], 'abc');
});

test('provider failures throw; unknown providers throw; console does not', async () => {
  await assert.rejects(createMessenger(baseCfg({ otp: { smsProvider: 'twilio' } }), { fetch: mockFetch(401) }).sendSms('9876543210', 'x'), /Twilio SMS failed with HTTP 401/);
  await assert.rejects(createMessenger(baseCfg({ otp: { smsProvider: 'carrier-pigeon' } })).sendSms('9876543210', 'x'), /Unknown SMS provider/);
  await createMessenger(baseCfg()).sendSms('9876543210', 'x');
  await createMessenger(baseCfg()).sendEmail('a@b.com', 's', 't');
});

test('SMTP email is handed to the mail transport', async () => {
  const sent = [];
  const transporter = { sendMail: async (m) => sent.push(m) };
  await createMessenger(baseCfg({ otp: { emailProvider: 'smtp' } }), { transporter }).sendEmail('stu@x.com', 'Your code', 'Code 123456');
  assert.deepEqual(sent[0], { from: 'Quiz <no-reply@x.com>', to: 'stu@x.com', subject: 'Your code', text: 'Code 123456' });
  await assert.rejects(createMessenger(baseCfg({ otp: { emailProvider: 'smtp' } })).sendEmail('a@b.com', 's', 't'), /SMTP is not configured/);
});

test('account recovery email always uses configured SMTP, independent of OTP settings', async () => {
  const sent = [];
  const transporter = { sendMail: async (message) => sent.push(message) };
  const cfg = baseCfg({
    smtp: { host: 'smtp.example.com', from: 'Quiz <no-reply@example.com>' },
    otp: { emailProvider: 'console' },
  });
  await createMessenger(cfg, { transporter }).sendAccountEmail('student@example.com', 'Reset your password', 'Code 123456');
  assert.deepEqual(sent, [{
    from: 'Quiz <no-reply@example.com>',
    to: 'student@example.com',
    subject: 'Reset your password',
    text: 'Code 123456',
  }]);
  await assert.rejects(
    createMessenger(baseCfg(), { transporter }).sendAccountEmail('student@example.com', 'Reset', 'Code'),
    /Account email is not configured/,
  );
});

test('production refuses weak secrets and warns about missing provider settings', () => {
  const ok = { env: 'production', jwtSecret: 'x'.repeat(40), otp: { enabled: false } };
  assert.deepEqual(assertSafeConfig(ok), []);
  assert.throws(() => assertSafeConfig({ ...ok, jwtSecret: 'change_me_to_a_long_random_string' }), /JWT_SECRET/);
  assert.throws(() => assertSafeConfig({ ...ok, jwtSecret: 'short' }), /JWT_SECRET/);
  assert.doesNotThrow(() => assertSafeConfig({ env: 'development', jwtSecret: 'dev-secret-change-me', otp: { enabled: false } }));
  const warn = assertSafeConfig({ ...ok, otp: { enabled: true, smsProvider: 'twilio', emailProvider: 'smtp' }, smtp: {}, sms: { twilio: {}, msg91: {}, http: {} } });
  assert.ok(warn.some((w) => /SMTP_HOST/.test(w)) && warn.some((w) => /TWILIO/.test(w)));
});

test('account lockout after repeated wrong passwords', () => {
  const cfg = { maxFailures: 3, minutes: 15 };
  const now = new Date('2026-01-01T10:00:00Z');
  let u = { failedLogins: 0, lockedUntil: null };
  let st = nextFailureState(u, cfg, now); assert.equal(st.locked, false); assert.equal(st.failedLogins, 1);
  u = { ...u, ...st }; st = nextFailureState(u, cfg, now); u = { ...u, ...st };
  st = nextFailureState(u, cfg, now);
  assert.equal(st.locked, true);
  assert.equal(st.lockedUntil.toISOString(), '2026-01-01T10:15:00.000Z');
  u = { failedLogins: 0, lockedUntil: st.lockedUntil };
  assert.equal(isLocked(u, new Date('2026-01-01T10:10:00Z')), true);
  assert.equal(isLocked(u, new Date('2026-01-01T10:16:00Z')), false);
  assert.equal(nextFailureState(u, cfg, new Date('2026-01-01T10:16:00Z')).failedLogins, 1); // fresh count after the lock expires
});

const essay = { type: 'ESSAY', text: 'Explain', points: 5, options: [], explanation: 'Model answer' };
const mc = { type: 'MULTIPLE_CHOICE', points: 1, options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: false }] };

test('essay answers wait for a teacher; blank essays score 0', () => {
  assert.equal(gradeAnswer(essay, { text: 'My answer' }).pending, true);
  assert.equal(gradeAnswer(essay, { text: '   ' }).answered, false);
  assert.equal(gradeAnswer(essay, null).pending, undefined);
});

test('attempt totals are held back until every essay is marked', () => {
  const qs = [
    { id: 'a', points: 1, answer: { choice: '0' }, snapshot: mc },
    { id: 'b', points: 5, answer: { text: 'long answer' }, snapshot: essay, gradedAt: null, score: null },
  ];
  const pending = gradeAttempt(qs, 50);
  assert.equal(pending.pending, 1);
  assert.equal(pending.score, null);
  assert.equal(pending.percent, null);
  assert.equal(pending.passed, null);
  assert.equal(pending.maxScore, 6);

  qs[1] = { ...qs[1], gradedAt: new Date(), score: 4 };
  const done = gradeAttempt(qs, 50);
  assert.equal(done.pending, 0);
  assert.equal(done.score, 5);
  assert.equal(done.percent, 83.33);
  assert.equal(done.passed, true);
  assert.equal(done.graded[1].manual, true);

  const blank = gradeAttempt([qs[0], { id: 'c', points: 5, answer: null, snapshot: essay }], 50);
  assert.equal(blank.pending, 0); // nothing to mark
  assert.equal(blank.score, 1);
});

test('results stay hidden while grading is pending, even with immediate release', () => {
  const quiz = { title: 'T', releaseMode: 'IMMEDIATE', passPercent: 50, showCorrectAnswers: true, showExplanations: true };
  const attempt = { id: 'a', status: 'SUBMITTED', releaseState: 'DEFAULT', needsGrading: true, attemptNo: 1, questions: [] };
  assert.equal(isReleased(attempt, quiz), false);
  assert.equal(isReleased({ ...attempt, releaseState: 'RELEASED' }, quiz), false);
  const hidden = buildResult(attempt, quiz);
  assert.equal(hidden.resultVisible, false);
  assert.equal(hidden.awaitingGrading, true);

  const graded = { ...attempt, needsGrading: false, score: 4, maxScore: 5, percent: 80, passed: true, questions: [{ id: 'q', position: 0, answer: { text: 'hi' }, score: 4, isCorrect: null, feedback: 'Good, add an example', snapshot: essay }] };
  const shown = buildResult(graded, quiz);
  assert.equal(shown.resultVisible, true);
  assert.equal(shown.review[0].feedback, 'Good, add an example');
  assert.equal(shown.review[0].explanation, 'Model answer');
});

test('essay validation, answers and CSV import', () => {
  assert.equal(validateQuestion({ type: 'ESSAY', text: 'Discuss', points: 10 }).errors.length, 0);
  assert.ok(validateQuestion({ type: 'ESSAY', text: '', points: 10 }).errors.length);
  assert.equal(parseAnswer(essay, { text: 'x'.repeat(10000) }).ok, true);
  assert.equal(parseAnswer(essay, { text: 'x'.repeat(10001) }).ok, false);
  const csv = 'question_id,question_type,question_text,points,correct_answer\nE1,essay,Explain gravity,5,\n';
  const p = parseCsv(Buffer.from(csv));
  const r = analyze({ ...p, mode: 'create', existingIds: new Set() });
  assert.deepEqual(r.errors, []);
  assert.equal(r.valid[0].value.type, 'ESSAY');
  assert.ok(buildTemplate('essay').includes('essay'));
});

test('reports: essay questions show average mark %, ungraded attempts are left out', () => {
  const aq = (score) => ({ questionId: 'E', snapshot: essay, answer: { text: 'x' }, score, points: 5, isCorrect: null, spentSeconds: 30 });
  const a = questionAnalysis([aq(4), aq(2)]);
  assert.equal(a[0].percentCorrect, 60);
  const att = (id, sid, percent) => ({ id, studentId: sid, attemptNo: 1, status: 'SUBMITTED', percent, passed: percent === null ? null : percent >= 50, score: null, maxScore: 5, student: { name: sid, userCode: sid }, questions: [] });
  const r = buildQuizReport({ quiz: { id: 'q', title: 'T', passPercent: 50 }, attempts: [att('1', 's1', 80), att('2', 's2', null)], assigned: 2 });
  assert.equal(r.summary.count, 1);
  assert.equal(r.summary.awaitingGrading, 1);
});
