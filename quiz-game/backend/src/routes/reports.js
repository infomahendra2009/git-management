import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { BASES, buildQuizReport, buildStudentReport, buildClassReport } from '../services/reports.js';
import { FORMATS, quizExport, studentExport, classExport } from '../services/exports.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN', 'TEACHER'));

// Teachers only ever see data for quizzes they own. Admins see everything.
const isAdmin = (req) => req.user.role === 'ADMIN';
const quizScope = (req) => (isAdmin(req) ? {} : { ownerId: req.user.id });
const basisOf = (req) => (BASES.includes(req.query.attempts) ? req.query.attempts : 'best');
const slug = (s) => String(s).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'report';

async function sendExport(req, res, rep, name) {
  const fmt = FORMATS[String(req.query.format || 'csv')];
  if (!fmt) return res.status(400).json({ error: 'Format must be csv, xlsx or pdf' });
  const body = await fmt.render(rep);
  res.set({ 'Content-Type': fmt.type, 'Content-Disposition': `attachment; filename="${slug(name)}.${fmt.ext}"` });
  res.send(body);
}

// ---------- loaders (shared by JSON and export routes) ----------
async function loadQuizReport(req) {
  const quiz = await prisma.quiz.findFirst({ where: { id: req.params.id, ...quizScope(req) } });
  if (!quiz) return null;
  const [attempts, assigns] = await Promise.all([
    prisma.attempt.findMany({ where: { quizId: quiz.id }, include: { student: { select: { name: true, userCode: true } }, questions: true } }),
    prisma.quizAssignment.findMany({ where: { quizId: quiz.id } }),
  ]);
  const classIds = assigns.filter((a) => a.classId).map((a) => a.classId);
  const members = classIds.length ? await prisma.classMember.findMany({ where: { classId: { in: classIds } }, select: { studentId: true } }) : [];
  const assigned = new Set([...assigns.filter((a) => a.studentId).map((a) => a.studentId), ...members.map((m) => m.studentId)]).size;
  return buildQuizReport({ quiz, attempts, assigned, basis: basisOf(req) });
}

async function loadStudentReport(req) {
  const student = await prisma.user.findFirst({ where: { id: req.params.id, role: 'STUDENT' }, select: { id: true, name: true, userCode: true, email: true, phone: true } });
  if (!student) return null;
  const attempts = await prisma.attempt.findMany({
    where: { studentId: student.id, status: 'SUBMITTED', ...(isAdmin(req) ? {} : { quiz: { ownerId: req.user.id } }) },
    include: { quiz: { select: { id: true, title: true, passPercent: true } }, questions: true },
  });
  return buildStudentReport({ student, attempts });
}

async function loadClassReport(req) {
  const klass = await prisma.class.findFirst({ where: { id: req.params.id, ...(isAdmin(req) ? {} : { ownerId: req.user.id }) } });
  if (!klass) return null;
  const members = await prisma.classMember.findMany({ where: { classId: klass.id }, include: { student: { select: { id: true, name: true, userCode: true } } } });
  const students = members.map((m) => m.student);
  const assigns = await prisma.quizAssignment.findMany({ where: { classId: klass.id, ...(isAdmin(req) ? {} : { quiz: { ownerId: req.user.id } }) }, include: { quiz: { select: { id: true, title: true } } } });
  const quizzes = assigns.map((a) => a.quiz);
  const attempts = students.length && quizzes.length
    ? await prisma.attempt.findMany({
        where: { studentId: { in: students.map((s) => s.id) }, quizId: { in: quizzes.map((q) => q.id) }, status: 'SUBMITTED' },
        select: { studentId: true, quizId: true, status: true, percent: true, passed: true },
      })
    : [];
  return buildClassReport({ klass: { id: klass.id, name: klass.name }, students, quizzes, attempts });
}

// ---------- overview ----------
router.get('/overview', async (req, res) => {
  const quizzes = await prisma.quiz.findMany({ where: quizScope(req), select: { id: true, title: true, status: true } });
  const ids = quizzes.map((q) => q.id);
  const inScope = { quizId: { in: ids }, status: 'SUBMITTED' };
  const [grouped, studentGroups, recent, questions, classes, inProgress] = ids.length
    ? await Promise.all([
        prisma.attempt.groupBy({ by: ['quizId', 'passed'], where: inScope, _count: { _all: true }, _sum: { percent: true } }),
        prisma.attempt.groupBy({ by: ['studentId'], where: inScope }),
        prisma.attempt.findMany({ where: inScope, orderBy: { submittedAt: 'desc' }, take: 8, include: { student: { select: { name: true } }, quiz: { select: { title: true } } } }),
        prisma.question.count({ where: quizScope(req) }),
        prisma.class.count({ where: quizScope(req) }),
        prisma.attempt.count({ where: { quizId: { in: ids }, status: 'IN_PROGRESS' } }),
      ])
    : [[], [], [], await prisma.question.count({ where: quizScope(req) }), await prisma.class.count({ where: quizScope(req) }), 0];

  const per = new Map(ids.map((id) => [id, { attempts: 0, sum: 0, passed: 0 }]));
  for (const g of grouped) {
    const p = per.get(g.quizId);
    p.attempts += g._count._all;
    p.sum += g._sum.percent || 0;
    if (g.passed) p.passed += g._count._all;
  }
  const tot = [...per.values()].reduce((a, p) => ({ attempts: a.attempts + p.attempts, sum: a.sum + p.sum, passed: a.passed + p.passed }), { attempts: 0, sum: 0, passed: 0 });
  const r1 = (x) => Math.round(x * 10) / 10;
  res.json({
    totals: {
      quizzes: quizzes.length, published: quizzes.filter((q) => q.status === 'PUBLISHED').length, questions, classes,
      students: studentGroups.length, attempts: tot.attempts, inProgress,
      avgPercent: tot.attempts ? r1(tot.sum / tot.attempts) : null, passRate: tot.attempts ? r1((tot.passed / tot.attempts) * 100) : null,
    },
    quizzes: quizzes.map((q) => {
      const p = per.get(q.id);
      return { id: q.id, title: q.title, status: q.status, attempts: p.attempts, avgPercent: p.attempts ? r1(p.sum / p.attempts) : null, passRate: p.attempts ? r1((p.passed / p.attempts) * 100) : null };
    }),
    recent: recent.map((a) => ({ id: a.id, student: a.student.name, quiz: a.quiz.title, percent: a.percent, passed: a.passed, submittedAt: a.submittedAt })),
  });
});

// ---------- per quiz ----------
router.get('/quizzes/:id', async (req, res) => {
  const r = await loadQuizReport(req);
  r ? res.json(r) : res.status(404).json({ error: 'Quiz not found' });
});
router.get('/quizzes/:id/export', async (req, res) => {
  const r = await loadQuizReport(req);
  if (!r) return res.status(404).json({ error: 'Quiz not found' });
  await sendExport(req, res, quizExport(r), `quiz_${r.quiz.title}`);
});

// ---------- per student ----------
router.get('/students/:id', async (req, res) => {
  const r = await loadStudentReport(req);
  r ? res.json(r) : res.status(404).json({ error: 'Student not found' });
});
router.get('/students/:id/export', async (req, res) => {
  const r = await loadStudentReport(req);
  if (!r) return res.status(404).json({ error: 'Student not found' });
  await sendExport(req, res, studentExport(r), `student_${r.student.userCode}`);
});

// ---------- per class ----------
router.get('/classes/:id', async (req, res) => {
  const r = await loadClassReport(req);
  r ? res.json(r) : res.status(404).json({ error: 'Class not found' });
});
router.get('/classes/:id/export', async (req, res) => {
  const r = await loadClassReport(req);
  if (!r) return res.status(404).json({ error: 'Class not found' });
  await sendExport(req, res, classExport(r), `class_${r.class.name}`);
});

// ---------- teacher-wise (admin only) ----------
router.get('/teachers', requireRole('ADMIN'), async (_req, res) => {
  const [owners, quizzes, grouped, questionCounts] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ['TEACHER', 'ADMIN'] } }, select: { id: true, name: true, userCode: true, role: true } }),
    prisma.quiz.findMany({ select: { id: true, ownerId: true } }),
    prisma.attempt.groupBy({ by: ['quizId', 'passed'], where: { status: 'SUBMITTED' }, _count: { _all: true }, _sum: { percent: true } }),
    prisma.question.groupBy({ by: ['ownerId'], _count: { _all: true } }),
  ]);
  const quizOwner = new Map(quizzes.map((q) => [q.id, q.ownerId]));
  const agg = new Map();
  for (const g of grouped) {
    const o = quizOwner.get(g.quizId);
    const a = agg.get(o) || { attempts: 0, sum: 0, passed: 0 };
    a.attempts += g._count._all; a.sum += g._sum.percent || 0; if (g.passed) a.passed += g._count._all;
    agg.set(o, a);
  }
  const r1 = (x) => Math.round(x * 10) / 10;
  const qc = new Map(questionCounts.map((q) => [q.ownerId, q._count._all]));
  res.json({
    teachers: owners.map((o) => {
      const a = agg.get(o.id) || { attempts: 0, sum: 0, passed: 0 };
      return { id: o.id, name: o.name, userCode: o.userCode, role: o.role, quizzes: quizzes.filter((q) => q.ownerId === o.id).length, questions: qc.get(o.id) || 0, attempts: a.attempts, avgPercent: a.attempts ? r1(a.sum / a.attempts) : null, passRate: a.attempts ? r1((a.passed / a.attempts) * 100) : null };
    }).filter((t) => t.quizzes || t.questions),
  });
});

export default router;
