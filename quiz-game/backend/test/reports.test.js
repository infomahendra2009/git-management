import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { pickAttempts, summarize, questionAnalysis, groupPerformance, buildQuizReport, buildStudentReport, buildClassReport, strengthsWeaknesses } from '../src/services/reports.js';
import { quizExport, studentExport, classExport, renderCsv, renderXlsx, renderPdf, safe } from '../src/services/exports.js';

const T0 = '2026-01-01T10:00:00Z';
const mcSnap = (cat, diff = 'EASY') => ({ type: 'MULTIPLE_CHOICE', text: 'Capital?', category: cat, difficulty: diff, points: 1, options: [{ text: 'Paris', isCorrect: true }, { text: 'Rome', isCorrect: false }] });
const aq = (qid, snap, answer, score) => ({ questionId: qid, snapshot: snap, answer, score, points: snap.points, isCorrect: score === snap.points, spentSeconds: 10 });
const att = (id, studentId, no, percent, qs = [], extra = {}) => ({
  id, studentId, attemptNo: no, status: 'SUBMITTED', percent, score: percent / 10, maxScore: 10, passed: percent >= 50,
  startedAt: T0, submittedAt: '2026-01-01T10:10:00Z', student: { name: studentId.toUpperCase(), userCode: `U-${studentId}` },
  quizId: 'q1', quiz: { id: 'q1', title: 'Quiz 1' }, releaseState: 'DEFAULT', autoSubmitted: false, questions: qs, ...extra,
});

test('which attempt counts: best / latest / first / all', () => {
  const list = [att('a1', 's1', 1, 40), att('a2', 's1', 2, 80), att('a3', 's1', 3, 60), att('b1', 's2', 1, 30), { ...att('x', 's3', 1, null), status: 'IN_PROGRESS' }];
  assert.equal(pickAttempts(list, 'best').find((a) => a.studentId === 's1').percent, 80);
  assert.equal(pickAttempts(list, 'latest').find((a) => a.studentId === 's1').percent, 60);
  assert.equal(pickAttempts(list, 'first').find((a) => a.studentId === 's1').percent, 40);
  assert.equal(pickAttempts(list, 'all').length, 4);
  assert.equal(pickAttempts(list, 'best').length, 2); // in-progress ignored
});

test('summary statistics and distribution', () => {
  const { summary, distribution } = summarize([att('a', 's1', 1, 100), att('b', 's2', 1, 50), att('c', 's3', 1, 20), att('d', 's4', 1, 0)]);
  assert.equal(summary.count, 4);
  assert.equal(summary.avgPercent, 42.5);
  assert.equal(summary.medianPercent, 35);
  assert.equal(summary.highest, 100);
  assert.equal(summary.lowest, 0);
  assert.equal(summary.passRate, 50);
  assert.equal(summary.avgTimeSeconds, 600);
  assert.equal(distribution[9].count, 1); // 100 lands in 90-100
  assert.equal(distribution[0].count, 1);
  assert.equal(summarize([]).summary.avgPercent, null);
});

test('question analysis finds the hardest question and common wrong answers', () => {
  const s = mcSnap('Geo');
  const qs = [
    aq('Q1', s, { choice: '0' }, 1), aq('Q1', s, { choice: '1' }, 0), aq('Q1', s, { choice: '1' }, 0), aq('Q1', s, null, 0),
    aq('Q2', { ...mcSnap('Geo'), text: 'Easy one' }, { choice: '0' }, 1),
  ];
  const r = questionAnalysis(qs);
  assert.equal(r[0].questionId, 'Q1'); // hardest first
  assert.equal(r[0].percentCorrect, 25);
  assert.equal(r[0].answered, 3);
  assert.deepEqual(r[0].topWrong[0], { answer: 'Rome', count: 2 });
  assert.equal(r[1].percentCorrect, 100);
  const text = questionAnalysis([aq('T', { type: 'TEXT_INPUT', text: 't', points: 1, options: [] }, { text: ' Lyon ' }, 0)]);
  assert.equal(text[0].topWrong[0].answer, 'lyon');
});

test('category and difficulty performance', () => {
  const qs = [aq('a', mcSnap('Math', 'HARD'), {}, 1), aq('b', mcSnap('Math', 'HARD'), {}, 0), aq('c', mcSnap(null, 'EASY'), {}, 1)];
  const cats = groupPerformance(qs, 'category', 'Uncategorised');
  assert.equal(cats.find((c) => c.name === 'Math').percent, 50);
  assert.ok(cats.find((c) => c.name === 'Uncategorised'));
  assert.ok(groupPerformance(qs, 'difficulty', 'Unspecified').find((c) => c.name === 'Hard'));
});

test('quiz report ties everything together', () => {
  const s = mcSnap('Geo');
  const attempts = [
    att('a1', 's1', 1, 40, [aq('Q1', s, { choice: '1' }, 0)]), att('a2', 's1', 2, 80, [aq('Q1', s, { choice: '0' }, 1)]),
    att('b1', 's2', 1, 30, [aq('Q1', s, { choice: '1' }, 0)]), { ...att('c1', 's3', 1, null), status: 'IN_PROGRESS' },
  ];
  const r = buildQuizReport({ quiz: { id: 'q1', title: 'Quiz 1', passPercent: 50, status: 'PUBLISHED' }, attempts, assigned: 4, basis: 'best' });
  assert.equal(r.summary.count, 2);
  assert.equal(r.summary.totalAttempts, 3);
  assert.equal(r.summary.attemptedStudents, 2);
  assert.equal(r.summary.completionRate, 50);
  assert.equal(r.summary.inProgress, 1);
  assert.equal(r.results[0].student, 'S1');
  assert.equal(r.questions[0].attempts, 2);
  assert.equal(buildQuizReport({ quiz: { id: 'q1', title: 'x', passPercent: 50 }, attempts, assigned: 4, basis: 'all' }).summary.count, 3);
});

test('student report: trend, strengths and weaknesses', () => {
  const a = att('1', 's1', 1, 90, [aq('a', mcSnap('Math'), {}, 1), aq('b', mcSnap('History'), {}, 0)]);
  const b = att('2', 's1', 1, 50, [aq('c', mcSnap('Math'), {}, 1), aq('d', mcSnap('History'), {}, 0)], { submittedAt: '2026-02-01T10:10:00Z', quizId: 'q2', quiz: { id: 'q2', title: 'Quiz 2' } });
  const r = buildStudentReport({ student: { id: 's1', name: 'S1', userCode: 'U' }, attempts: [b, a] });
  assert.equal(r.trend.length, 2);
  assert.equal(r.trend[0].percent, 90); // sorted oldest first
  assert.equal(r.attempts[0].quizTitle, 'Quiz 2'); // list is newest first
  assert.equal(r.summary.avgPercent, 70);
  assert.deepEqual(r.strengths, ['Math']);
  assert.deepEqual(r.weaknesses, ['History']);
  assert.deepEqual(strengthsWeaknesses([{ name: 'Only', percent: 90 }]), { strengths: [], weaknesses: [] });
  assert.equal(buildStudentReport({ student: {}, attempts: [] }).summary.avgPercent, null);
});

test('class report grid uses each student\'s best attempt', () => {
  const r = buildClassReport({
    klass: { id: 'c', name: 'A' },
    students: [{ id: 's1', name: 'Zed', userCode: 'Z' }, { id: 's2', name: 'Amy', userCode: 'A' }],
    quizzes: [{ id: 'q1', title: 'Q1' }, { id: 'q2', title: 'Q2' }],
    attempts: [
      { studentId: 's1', quizId: 'q1', status: 'SUBMITTED', percent: 40, passed: false }, { studentId: 's1', quizId: 'q1', status: 'SUBMITTED', percent: 90, passed: true },
      { studentId: 's2', quizId: 'q1', status: 'SUBMITTED', percent: 20, passed: false },
    ],
  });
  assert.equal(r.students[0].name, 'Amy'); // sorted by name
  const zed = r.students.find((s) => s.id === 's1');
  assert.equal(zed.cells.q1.percent, 90);
  assert.equal(zed.cells.q2, null);
  assert.equal(zed.avgPercent, 90);
  assert.equal(r.quizStats[0].attempted, 2);
  assert.equal(r.quizStats[0].passRate, 50);
  assert.equal(r.quizStats[1].attempted, 0);
});

test('exports: CSV blocks formula injection, XLSX and PDF are real files', async () => {
  assert.equal(safe('=HYPERLINK("x")'), `'=HYPERLINK("x")`);
  assert.equal(safe('+1'), `'+1`);
  assert.equal(safe(-5), -5);
  assert.equal(safe(null), '');

  const s = mcSnap('Geo');
  const attempts = [att('a1', 's1', 1, 80, [aq('Q1', s, { choice: '0' }, 1)]), att('b1', 's2', 1, 30, [aq('Q9', { ...s, text: '=EVIL()' }, { choice: '1' }, 0)])];
  const rep = quizExport(buildQuizReport({ quiz: { id: 'q1', title: 'Quiz 1', passPercent: 50 }, attempts, assigned: 2 }));

  const csv = renderCsv(rep);
  assert.ok(csv.startsWith('\ufeffQuiz report: Quiz 1'));
  assert.ok(csv.includes("'=EVIL()"));
  assert.ok(!/(^|,)=EVIL/m.test(csv));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await renderXlsx(rep));
  assert.deepEqual(wb.worksheets.map((w) => w.name), ['Summary', 'Results', 'Question analysis', 'Categories']);
  assert.equal(wb.getWorksheet('Results').rowCount, 3);
  assert.equal(wb.getWorksheet('Results').getRow(2).getCell(1).value, 'S1');

  const pdf = await renderPdf(rep);
  assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  assert.ok(pdf.length > 1000);

  // long tables paginate and non-Latin text does not crash the PDF
  const big = { title: 'हिन्दी Title', subtitle: 's', sections: [{ heading: 'Rows', headers: ['A', 'B'], rows: Array.from({ length: 200 }, (_, i) => [i, 'नमस्ते ' + i]) }] };
  assert.equal((await renderPdf(big)).subarray(0, 4).toString(), '%PDF');
  assert.ok((await renderXlsx(big)).length > 500);
  assert.ok(studentExport(buildStudentReport({ student: { name: 'N', userCode: 'U' }, attempts: attempts })).sections.length === 4);
  assert.ok(classExport(buildClassReport({ klass: { name: 'A' }, students: [], quizzes: [], attempts: [] })).sections.length === 2);
});
