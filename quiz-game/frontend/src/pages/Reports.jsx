import { useEffect, useState } from 'react';
import { api, download } from '../api.js';
import { Stat, Bars, Histogram, Trend } from './Charts.jsx';

const mins = (s) => (s === null || s === undefined ? '—' : `${Math.round((s / 60) * 10) / 10} min`);
const when = (d) => (d ? new Date(d).toLocaleString() : '');
const Result = ({ passed }) => (passed === null || passed === undefined ? '—' : passed ? <span className="pill-ok">Pass</span> : <span className="pill-no">Fail</span>);

function Export({ path, query = '', name }) {
  const [err, setErr] = useState('');
  return (
    <div className="row" style={{ flex: '0 0 auto' }}>
      <span className="muted" style={{ flex: '0 0 auto', minWidth: 0 }}>Export:</span>
      {['csv', 'xlsx', 'pdf'].map((f) => (
        <button key={f} className="secondary small" onClick={() => download(`${path}?format=${f}${query ? `&${query}` : ''}`, `${name}.${f}`).catch((e) => setErr(e.message))}>{f.toUpperCase()}</button>
      ))}
      {err && <span className="err">{err}</span>}
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ go }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/reports/overview').then(setD).catch((e) => setErr(e.message)); }, []);
  if (!d) return <div className="card muted">{err || 'Loading…'}</div>;
  const t = d.totals;
  return (
    <>
      <div className="stats">
        <Stat label="Quizzes" value={t.quizzes} sub={`${t.published} published`} />
        <Stat label="Questions" value={t.questions} />
        <Stat label="Classes" value={t.classes} />
        <Stat label="Students attempted" value={t.students} />
        <Stat label="Submitted attempts" value={t.attempts} sub={t.inProgress ? `${t.inProgress} in progress` : ''} />
        <Stat label="Average score" value={t.avgPercent === null ? null : `${t.avgPercent}%`} />
        <Stat label="Pass rate" value={t.passRate === null ? null : `${t.passRate}%`} />
      </div>
      <div className="card">
        <h3>Quizzes</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Quiz</th><th>Status</th><th>Attempts</th><th>Avg %</th><th>Pass rate</th><th></th></tr></thead>
            <tbody>
              {d.quizzes.map((q) => (
                <tr key={q.id}><td>{q.title}</td><td>{q.status === 'PUBLISHED' ? 'Published' : 'Draft'}</td><td>{q.attempts}</td><td>{q.avgPercent ?? '—'}</td><td>{q.passRate === null ? '—' : `${q.passRate}%`}</td>
                  <td><button className="secondary small" onClick={() => go('quiz', { quizId: q.id })}>Report</button></td></tr>
              ))}
              {d.quizzes.length === 0 && <tr><td colSpan={6} className="muted">No quizzes yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Latest submissions</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Quiz</th><th>%</th><th>Result</th><th>When</th></tr></thead>
            <tbody>
              {d.recent.map((r) => <tr key={r.id}><td>{r.student}</td><td>{r.quiz}</td><td>{r.percent}</td><td><Result passed={r.passed} /></td><td>{when(r.submittedAt)}</td></tr>)}
              {d.recent.length === 0 && <tr><td colSpan={5} className="muted">Nothing submitted yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Quiz report ---------- */
function QuizReport({ quizId: initial, go }) {
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState(initial || '');
  const [basis, setBasis] = useState('best');
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => { api('/quizzes').then((x) => setQuizzes(x.quizzes)).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    setR(null); setErr('');
    if (quizId) api(`/reports/quizzes/${quizId}?attempts=${basis}`).then(setR).catch((e) => setErr(e.message));
  }, [quizId, basis]);

  const s = r?.summary;
  return (
    <>
      <div className="card">
        <div className="row">
          <div><label>Quiz</label>
            <select value={quizId} onChange={(e) => setQuizId(e.target.value)}>
              <option value="">Choose a quiz…</option>
              {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select></div>
          <div><label>If a student attempted more than once, count their</label>
            <select value={basis} onChange={(e) => setBasis(e.target.value)}>
              <option value="best">Best attempt</option><option value="latest">Latest attempt</option><option value="first">First attempt</option><option value="all">All attempts</option>
            </select></div>
          {r && <Export path={`/reports/quizzes/${quizId}/export`} query={`attempts=${basis}`} name={`quiz_report`} />}
        </div>
        {err && <div className="err">{err}</div>}
      </div>

      {r && (
        <>
          <div className="stats">
            <Stat label="Assigned students" value={s.assigned} />
            <Stat label="Attempted" value={s.attemptedStudents} sub={s.completionRate === null ? '' : `${s.completionRate}%`} />
            <Stat label="Average" value={s.avgPercent === null ? null : `${s.avgPercent}%`} />
            <Stat label="Median" value={s.medianPercent === null ? null : `${s.medianPercent}%`} />
            <Stat label="Highest" value={s.highest === null ? null : `${s.highest}%`} />
            <Stat label="Lowest" value={s.lowest === null ? null : `${s.lowest}%`} />
            <Stat label="Pass rate" value={s.passRate === null ? null : `${s.passRate}%`} sub={`pass mark ${r.quiz.passPercent}%`} />
            <Stat label="Average time" value={mins(s.avgTimeSeconds)} />
            {s.awaitingGrading > 0 && <Stat label="Awaiting grading" value={s.awaitingGrading} sub="not counted yet" />}
          </div>
          <div className="card"><h3>Score distribution</h3><Histogram buckets={r.distribution} /></div>
          <div className="row" style={{ alignItems: 'stretch' }}>
            <div className="card"><h3>By category</h3><Bars items={r.categories.map((c) => ({ label: c.name, value: c.percent }))} /></div>
            <div className="card"><h3>By difficulty</h3><Bars items={r.difficulty.map((c) => ({ label: c.name, value: c.percent }))} /></div>
          </div>
          <div className="card">
            <h3>Students ({r.results.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>ID</th><th>Attempt</th><th>Score</th><th>%</th><th>Result</th><th>Time</th><th>Submitted</th></tr></thead>
                <tbody>
                  {r.results.map((x) => (
                    <tr key={x.attemptId}>
                      <td><button className="linkbtn" onClick={() => go('student', { studentId: x.studentId })}>{x.student}</button></td>
                      <td>{x.userCode}</td><td>#{x.attemptNo}{x.autoSubmitted ? ' (auto)' : ''}</td><td>{x.score}/{x.maxScore}</td><td>{x.percent}</td>
                      <td><Result passed={x.passed} /></td><td>{mins(x.timeTakenSeconds)}</td><td>{when(x.submittedAt)}</td>
                    </tr>
                  ))}
                  {r.results.length === 0 && <tr><td colSpan={8} className="muted">No submitted attempts yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h3>Question analysis <span className="muted" style={{ fontSize: 13 }}>(hardest first)</span></h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Question</th><th>% correct</th><th>Answered</th><th>Avg time</th><th>Common wrong answer</th></tr></thead>
                <tbody>
                  {r.questions.map((q, i) => (
                    <tr key={q.questionId || i}>
                      <td>{i + 1}</td>
                      <td style={{ whiteSpace: 'normal', minWidth: 240 }}>
                        {q.text.slice(0, 140)}
                        {q.options.length > 0 && <div className="sub">{q.options.map((o) => `${o.isCorrect ? '✔ ' : ''}${o.label} (${o.count})`).join(' · ')}</div>}
                      </td>
                      <td><span className={q.percentCorrect < 50 ? 'pill-no' : q.percentCorrect >= 70 ? 'pill-ok' : ''}>{q.percentCorrect}%</span></td>
                      <td>{q.answered}/{q.attempts}</td><td>{q.avgTimeSeconds}s</td>
                      <td>{q.topWrong[0] ? `${q.topWrong[0].answer} (${q.topWrong[0].count})` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ---------- Student report ---------- */
export function StudentBody({ r }) {
  const s = r.summary;
  return (
    <>
      <div className="stats">
        <Stat label="Attempts" value={s.attempts} /><Stat label="Quizzes" value={s.quizzes} />
        <Stat label="Average" value={s.avgPercent === null ? null : `${s.avgPercent}%`} /><Stat label="Best" value={s.best === null ? null : `${s.best}%`} />
        <Stat label="Latest" value={s.latest === null ? null : `${s.latest}%`} /><Stat label="Passed" value={`${s.passedCount}/${s.attempts}`} />
      </div>
      <div className="card"><h3>Score trend</h3><Trend points={r.trend.map((t) => ({ label: `${t.quizTitle} (${new Date(t.date).toLocaleDateString()})`, value: t.percent }))} /></div>
      {(r.strengths.length > 0 || r.weaknesses.length > 0) && (
        <div className="card">
          {r.strengths.length > 0 && <p><span className="pill-ok">Strong in:</span> {r.strengths.join(', ')}</p>}
          {r.weaknesses.length > 0 && <p><span className="pill-no">Needs work in:</span> {r.weaknesses.join(', ')}</p>}
          <p className="muted">Strong = 70% or more, needs work = under 60%, compared across topics.</p>
        </div>
      )}
      <div className="row" style={{ alignItems: 'stretch' }}>
        <div className="card"><h3>By category</h3><Bars items={r.categories.map((c) => ({ label: c.name, value: c.percent }))} /></div>
        <div className="card"><h3>By difficulty</h3><Bars items={r.difficulty.map((c) => ({ label: c.name, value: c.percent }))} /></div>
      </div>
      <div className="card">
        <h3>Attempts</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Quiz</th><th>#</th><th>Submitted</th><th>Score</th><th>%</th><th>Result</th><th>Time</th></tr></thead>
            <tbody>
              {r.attempts.map((a) => <tr key={a.id}><td>{a.quizTitle}</td><td>{a.attemptNo}</td><td>{when(a.submittedAt)}</td><td>{a.score}/{a.maxScore}</td><td>{a.percent}</td><td><Result passed={a.passed} /></td><td>{mins(a.timeTakenSeconds)}</td></tr>)}
              {r.attempts.length === 0 && <tr><td colSpan={7} className="muted">No submitted attempts</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StudentReport({ studentId: initial }) {
  const [studentId, setStudentId] = useState(initial || '');
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');

  const search = (t = q) => api(`/users?role=STUDENT${t ? `&q=${encodeURIComponent(t)}` : ''}`).then((x) => setList(x.users)).catch((e) => setErr(e.message));
  useEffect(() => { search(''); }, []);
  useEffect(() => {
    setR(null); setErr('');
    if (studentId) api(`/reports/students/${studentId}`).then(setR).catch((e) => setErr(e.message));
  }, [studentId]);

  return (
    <>
      <div className="card">
        <div className="row">
          <input placeholder="Search student by name, email, phone or ID" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="secondary" onClick={() => search()}>Search</button>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Choose a student…</option>
            {list.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.userCode})</option>)}
            {studentId && !list.some((s) => s.id === studentId) && <option value={studentId}>Selected student</option>}
          </select>
          {r && <Export path={`/reports/students/${studentId}/export`} name={`student_${r.student.userCode}`} />}
        </div>
        {err && <div className="err">{err}</div>}
      </div>
      {r && <><div className="card"><h3>{r.student.name} <span className="muted">{r.student.userCode} · {r.student.email} · {r.student.phone}</span></h3>
        <p className="muted">{`Includes attempts on your quizzes only (admins see all quizzes).`}</p></div><StudentBody r={r} /></>}
    </>
  );
}

/* ---------- Class report ---------- */
function ClassReport() {
  const [classes, setClasses] = useState([]);
  const [id, setId] = useState('');
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/classes').then((x) => setClasses(x.classes)).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    setR(null); setErr('');
    if (id) api(`/reports/classes/${id}`).then(setR).catch((e) => setErr(e.message));
  }, [id]);

  return (
    <>
      <div className="card">
        <div className="row">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">Choose a class…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.members})</option>)}
          </select>
          {r && <Export path={`/reports/classes/${id}/export`} name={`class_${r.class.name}`} />}
        </div>
        {err && <div className="err">{err}</div>}
      </div>
      {r && (
        <>
          <div className="card">
            <h3>{r.class.name}: best attempt per quiz (%)</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>ID</th>{r.quizzes.map((q) => <th key={q.id}>{q.title}</th>)}<th>Avg</th><th>Done</th></tr></thead>
                <tbody>
                  {r.students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td><td>{s.userCode}</td>
                      {r.quizzes.map((q) => { const c = s.cells[q.id]; return <td key={q.id} className={c ? (c.passed ? 'cell-ok' : 'cell-no') : ''}>{c ? c.percent : '—'}</td>; })}
                      <td>{s.avgPercent ?? '—'}</td><td>{s.completed}/{r.quizzes.length}</td>
                    </tr>
                  ))}
                  {r.students.length === 0 && <tr><td colSpan={4 + r.quizzes.length} className="muted">No students in this class</td></tr>}
                </tbody>
              </table>
            </div>
            {r.quizzes.length === 0 && <p className="muted">No quizzes are assigned to this class yet.</p>}
          </div>
          {r.quizStats.length > 0 && (
            <div className="card">
              <h3>Quiz statistics</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Quiz</th><th>Attempted</th><th>Avg %</th><th>Pass rate</th></tr></thead>
                  <tbody>{r.quizStats.map((q) => <tr key={q.quizId}><td>{q.title}</td><td>{q.attempted}/{q.assigned}</td><td>{q.avgPercent ?? '—'}</td><td>{q.passRate === null ? '—' : `${q.passRate}%`}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ---------- Teacher-wise (admin) ---------- */
function TeacherReport() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/reports/teachers').then((x) => setRows(x.teachers)).catch((e) => setErr(e.message)); }, []);
  if (!rows) return <div className="card muted">{err || 'Loading…'}</div>;
  return (
    <div className="card">
      <h3>Teacher-wise summary</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>ID</th><th>Role</th><th>Questions</th><th>Quizzes</th><th>Attempts</th><th>Avg %</th><th>Pass rate</th></tr></thead>
          <tbody>
            {rows.map((t) => <tr key={t.id}><td>{t.name}</td><td>{t.userCode}</td><td>{t.role}</td><td>{t.questions}</td><td>{t.quizzes}</td><td>{t.attempts}</td><td>{t.avgPercent ?? '—'}</td><td>{t.passRate === null ? '—' : `${t.passRate}%`}</td></tr>)}
            {rows.length === 0 && <tr><td colSpan={8} className="muted">No teachers have created content yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Container ---------- */
export default function Reports({ user }) {
  const [view, setView] = useState({ name: 'overview' });
  const go = (name, extra = {}) => setView({ name, ...extra });
  const tabs = [['overview', 'Overview'], ['quiz', 'By quiz'], ['student', 'By student'], ['class', 'By class'], ...(user.role === 'ADMIN' ? [['teacher', 'By teacher']] : [])];
  return (
    <>
      <div className="subtabs">
        {tabs.map(([k, label]) => <button key={k} className={view.name === k ? '' : 'secondary'} onClick={() => go(k)}>{label}</button>)}
      </div>
      {view.name === 'overview' && <Overview go={go} />}
      {view.name === 'quiz' && <QuizReport key={view.quizId || 'q'} quizId={view.quizId} go={go} />}
      {view.name === 'student' && <StudentReport key={view.studentId || 's'} studentId={view.studentId} />}
      {view.name === 'class' && <ClassReport />}
      {view.name === 'teacher' && <TeacherReport />}
    </>
  );
}
