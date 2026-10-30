import { useEffect, useState } from 'react';
import { api } from '../api.js';

const toLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const toIso = (v) => (v ? new Date(v).toISOString() : '');

const DEFAULTS = {
  title: '', description: '', passPercent: 50, timeLimitMinutes: '', attemptsAllowed: 1, questionOrder: 'SEQUENTIAL',
  oneAtATime: true, showProgress: true, allowReview: true, releaseMode: 'MANUAL', releaseAt: '',
  showCorrectAnswers: true, showExplanations: true, startsAt: '', endsAt: '',
};

function Check({ label, value, onChange }) {
  return <label className="check"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
}

/* ---------------- Settings ---------------- */
function Settings({ s, setS, onSave, busy, isNew }) {
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const chk = (k) => (v) => setS({ ...s, [k]: v });
  return (
    <form className="card" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <label>Quiz title</label>
      <input value={s.title} onChange={set('title')} required />
      <label>Description / instructions</label>
      <textarea value={s.description} onChange={set('description')} />
      <div className="row">
        <div><label>Pass percentage</label><input type="number" min="0" max="100" value={s.passPercent} onChange={set('passPercent')} /></div>
        <div><label>Time limit (minutes, blank = none)</label><input type="number" min="1" value={s.timeLimitMinutes} onChange={set('timeLimitMinutes')} /></div>
        <div><label>Attempts allowed</label><input type="number" min="1" max="20" value={s.attemptsAllowed} onChange={set('attemptsAllowed')} /></div>
      </div>
      <div className="row">
        <div><label>Opens at (optional)</label><input type="datetime-local" value={s.startsAt} onChange={set('startsAt')} /></div>
        <div><label>Closes at (optional)</label><input type="datetime-local" value={s.endsAt} onChange={set('endsAt')} /></div>
      </div>
      <div className="row">
        <div>
          <label>Question order</label>
          <select value={s.questionOrder} onChange={set('questionOrder')}><option value="SEQUENTIAL">In the order I set</option><option value="RANDOM">Random for each student</option></select>
        </div>
        <div>
          <label>Release results to students</label>
          <select value={s.releaseMode} onChange={set('releaseMode')}>
            <option value="MANUAL">Manually (teacher/admin releases)</option>
            <option value="IMMEDIATE">Immediately after submit</option>
            <option value="SCHEDULED">At a scheduled time</option>
            <option value="NEVER">Never (staff only)</option>
          </select>
        </div>
        {s.releaseMode === 'SCHEDULED' && <div><label>Release at</label><input type="datetime-local" value={s.releaseAt} onChange={set('releaseAt')} /></div>}
      </div>
      <Check label="Show one question at a time" value={s.oneAtATime} onChange={chk('oneAtATime')} />
      <Check label="Show progress bar" value={s.showProgress} onChange={chk('showProgress')} />
      <Check label="Allow going back to earlier questions" value={s.allowReview} onChange={chk('allowReview')} />
      <Check label="Show correct answers in released results" value={s.showCorrectAnswers} onChange={chk('showCorrectAnswers')} />
      <Check label="Show explanations in released results" value={s.showExplanations} onChange={chk('showExplanations')} />
      <div style={{ marginTop: 16 }}><button disabled={busy}>{isNew ? 'Create quiz' : 'Save settings'}</button></div>
    </form>
  );
}

/* ---------------- Questions picker ---------------- */
function QuizQuestions({ quizId, initial, locked, onSaved }) {
  const [sel, setSel] = useState(initial);
  const [bank, setBank] = useState([]);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const search = (text = q) => api(`/questions?pageSize=50${text ? `&q=${encodeURIComponent(text)}` : ''}`).then((r) => setBank(r.items)).catch((e) => setErr(e.message));
  useEffect(() => { search(''); }, []);

  const has = (id) => sel.some((x) => x.id === id);
  const move = (i, d) => setSel((p) => { const a = [...p]; const j = i + d; if (j < 0 || j >= a.length) return p; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const total = sel.reduce((s, x) => s + Number(x.points), 0);

  const save = async () => {
    setErr(''); setMsg('');
    try { await api(`/quizzes/${quizId}/questions`, { method: 'PUT', body: { questionIds: sel.map((x) => x.id) } }); setMsg('Questions saved.'); onSaved(); }
    catch (e) { setErr(e.message); }
  };

  return (
    <>
      {locked && <div className="card err">Questions are locked because students have already attempted this quiz.</div>}
      <div className="card">
        <h3>In this quiz: {sel.length} questions · {total} points</h3>
        <div className="table-wrap">
          <table>
            <tbody>
              {sel.map((x, i) => (
                <tr key={x.id}>
                  <td>{i + 1}</td><td style={{ whiteSpace: 'normal', minWidth: 200 }}>{x.text || '(image question)'}</td><td>{x.type}</td><td>{x.points} pt</td>
                  <td><div className="row">
                    <button disabled={locked} className="secondary small" onClick={() => move(i, -1)}>↑</button>
                    <button disabled={locked} className="secondary small" onClick={() => move(i, 1)}>↓</button>
                    <button disabled={locked} className="danger small" onClick={() => setSel(sel.filter((y) => y.id !== x.id))}>Remove</button>
                  </div></td>
                </tr>
              ))}
              {sel.length === 0 && <tr><td className="muted">No questions yet. Add some from your question bank below.</td></tr>}
            </tbody>
          </table>
        </div>
        {msg && <div className="ok">{msg}</div>}{err && <div className="err">{err}</div>}
        <div style={{ marginTop: 12 }}><button disabled={locked} onClick={save}>Save questions</button></div>
      </div>
      <div className="card">
        <h3>Question bank</h3>
        <div className="row"><input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} /><button className="secondary" onClick={() => search()}>Search</button></div>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table>
            <tbody>
              {bank.map((b) => (
                <tr key={b.id}>
                  <td style={{ whiteSpace: 'normal', minWidth: 200 }}>{b.text || '(image question)'}</td><td>{b.type}</td><td>{b.category || ''}</td><td>{b.points} pt</td>
                  <td><button disabled={locked || has(b.id)} className="secondary small" onClick={() => setSel([...sel, { id: b.id, text: b.text, type: b.type, points: b.points }])}>{has(b.id) ? 'Added' : 'Add'}</button></td>
                </tr>
              ))}
              {bank.length === 0 && <tr><td className="muted">No questions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- Assign ---------------- */
function Assign({ quizId, initial }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [cSel, setCSel] = useState(new Set(initial.classIds));
  const [sSel, setSSel] = useState(new Set(initial.studentIds));
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadStudents = (t = '') => api(`/users?role=STUDENT${t ? `&q=${encodeURIComponent(t)}` : ''}`).then((r) => setStudents(r.users.filter((u) => u.isActive))).catch((e) => setErr(e.message));
  useEffect(() => { api('/classes').then((r) => setClasses(r.classes)).catch((e) => setErr(e.message)); loadStudents(); }, []);
  const tog = (set, setter, id) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n); };

  const save = async () => {
    setErr(''); setMsg('');
    try { const r = await api(`/quizzes/${quizId}/assignments`, { method: 'PUT', body: { classIds: [...cSel], studentIds: [...sSel] } }); setMsg(`Assigned to ${r.classes} classes and ${r.students} individual students.`); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div className="card">
      <h3>Assign to classes</h3>
      <div className="listbox">
        {classes.map((c) => <label key={c.id}><input type="checkbox" checked={cSel.has(c.id)} onChange={() => tog(cSel, setCSel, c.id)} /> {c.name} <span className="muted">({c.members} students)</span></label>)}
        {classes.length === 0 && <span className="muted">No classes yet. Create one in the Classes tab.</span>}
      </div>
      <h3 style={{ marginTop: 16 }}>…and/or individual students</h3>
      <div className="row"><input placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadStudents(q)} /><button className="secondary" onClick={() => loadStudents(q)}>Search</button></div>
      <div className="listbox" style={{ marginTop: 10 }}>
        {students.map((s) => <label key={s.id}><input type="checkbox" checked={sSel.has(s.id)} onChange={() => tog(sSel, setSSel, s.id)} /> {s.name} <span className="muted">{s.userCode}</span></label>)}
      </div>
      {msg && <div className="ok">{msg}</div>}{err && <div className="err">{err}</div>}
      <div style={{ marginTop: 12 }}><button onClick={save}>Save assignment</button></div>
    </div>
  );
}

/* ---------------- Attempts & release ---------------- */
function Attempts({ quizId }) {
  const [data, setData] = useState({ attempts: [], releaseMode: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const load = () => api(`/quizzes/${quizId}/attempts`).then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const release = async (state, attemptIds) => {
    setErr(''); setMsg('');
    try { const r = await api(`/quizzes/${quizId}/release`, { method: 'POST', body: { state, ...(attemptIds ? { attemptIds } : {}) } }); setMsg(`Updated ${r.updated} attempt(s).`); load(); }
    catch (e) { setErr(e.message); }
  };
  const done = data.attempts.filter((a) => a.status === 'SUBMITTED');

  return (
    <div className="card">
      <h3>Attempts ({data.attempts.length})</h3>
      <p className="muted">Release mode for this quiz: <strong>{data.releaseMode}</strong>. Overrides below apply per attempt.</p>
      <div className="row" style={{ marginBottom: 10 }}>
        <button disabled={!done.length} onClick={() => release('RELEASED')}>Release all</button>
        <button disabled={!done.length} className="secondary" onClick={() => release('HIDDEN')}>Hide all</button>
        <button disabled={!done.length} className="secondary" onClick={() => release('DEFAULT')}>Reset to quiz setting</button>
      </div>
      {msg && <div className="ok">{msg}</div>}{err && <div className="err">{err}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>ID</th><th>#</th><th>Status</th><th>Score</th><th>%</th><th>Result</th><th>Student sees</th><th></th></tr></thead>
          <tbody>
            {data.attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.student}</td><td>{a.userCode}</td><td>{a.attemptNo}</td>
                <td>{a.status === 'IN_PROGRESS' ? 'In progress' : a.needsGrading ? <span className="pill-no">Needs grading</span> : a.autoSubmitted ? 'Auto-submitted' : 'Submitted'}</td>
                <td>{a.score !== null ? `${a.score}/${a.maxScore}` : '—'}</td><td>{a.percent ?? '—'}</td>
                <td>{a.passed === null ? '—' : a.passed ? <span className="pill-ok">Pass</span> : <span className="pill-no">Fail</span>}</td>
                <td>{a.status === 'SUBMITTED' ? (a.visibleToStudent ? 'Released' : 'Hidden') : '—'}</td>
                <td>{a.status === 'SUBMITTED' && (a.visibleToStudent
                  ? <button className="secondary small" onClick={() => release('HIDDEN', [a.id])}>Hide</button>
                  : <button className="secondary small" onClick={() => release('RELEASED', [a.id])}>Release</button>)}</td>
              </tr>
            ))}
            {data.attempts.length === 0 && <tr><td colSpan={9} className="muted">No attempts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Editor ---------------- */
function QuizEditor({ id: initialId, onBack }) {
  const [id, setId] = useState(initialId);
  const [s, setS] = useState(DEFAULTS);
  const [detail, setDetail] = useState(null);
  const [section, setSection] = useState('settings');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (qid = id) => {
    if (!qid) return;
    const r = await api(`/quizzes/${qid}`);
    setDetail(r);
    setS({ ...DEFAULTS, ...r.quiz, description: r.quiz.description || '', timeLimitMinutes: r.quiz.timeLimitMinutes ?? '', releaseAt: toLocal(r.quiz.releaseAt), startsAt: toLocal(r.quiz.startsAt), endsAt: toLocal(r.quiz.endsAt) });
  };
  useEffect(() => { load().catch((e) => setErr(e.message)); }, []);

  const saveSettings = async () => {
    setErr(''); setMsg(''); setBusy(true);
    const body = { ...s, passPercent: Number(s.passPercent), attemptsAllowed: Number(s.attemptsAllowed), timeLimitMinutes: s.timeLimitMinutes === '' ? '' : Number(s.timeLimitMinutes), releaseAt: toIso(s.releaseAt), startsAt: toIso(s.startsAt), endsAt: toIso(s.endsAt) };
    try {
      if (id) { await api(`/quizzes/${id}`, { method: 'PUT', body }); setMsg('Settings saved.'); await load(); }
      else { const r = await api('/quizzes', { method: 'POST', body }); setId(r.quiz.id); await load(r.quiz.id); setSection('questions'); setMsg('Quiz created. Now add questions.'); }
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const setStatus = async (action) => {
    setErr(''); setMsg('');
    try { await api(`/quizzes/${id}/${action}`, { method: 'POST' }); setMsg(action === 'publish' ? 'Published. Assigned students can now see it.' : 'Unpublished (hidden from students).'); await load(); }
    catch (e) { setErr(e.message); }
  };

  const status = detail?.quiz.status;
  const tabs = [['settings', 'Settings'], ['questions', 'Questions'], ['assign', 'Assign'], ['attempts', 'Results']];

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{s.title || 'New quiz'} {status && <span className={`badge ${status === 'PUBLISHED' ? '' : 'off'}`}>{status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>}</h3>
          <div className="row" style={{ flex: '0 0 auto' }}>
            {id && (status === 'PUBLISHED'
              ? <button className="secondary" onClick={() => setStatus('unpublish')}>Unpublish</button>
              : <button onClick={() => setStatus('publish')}>Publish</button>)}
            <button className="secondary" onClick={onBack}>← All quizzes</button>
          </div>
        </div>
        {detail && <p className="muted">{detail.questions.length} questions · {detail.totalPoints} points · {detail.attemptCount} attempts</p>}
        {msg && <div className="ok">{msg}</div>}{err && <div className="err">{err}</div>}
      </div>
      <div className="subtabs">
        {tabs.map(([k, label]) => <button key={k} disabled={!id && k !== 'settings'} className={section === k ? '' : 'secondary'} onClick={() => setSection(k)}>{label}</button>)}
      </div>
      {section === 'settings' && <Settings s={s} setS={setS} onSave={saveSettings} busy={busy} isNew={!id} />}
      {section === 'questions' && detail && <QuizQuestions key={detail.questions.map((x) => x.id).join()} quizId={id} initial={detail.questions} locked={detail.attemptCount > 0} onSaved={() => load()} />}
      {section === 'assign' && detail && <Assign quizId={id} initial={detail.assignments} />}
      {section === 'attempts' && id && <Attempts quizId={id} />}
    </>
  );
}

/* ---------------- List ---------------- */
export default function Quizzes({ user }) {
  const [view, setView] = useState({ name: 'list' });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = () => api('/quizzes').then((r) => setRows(r.quizzes)).catch((e) => setErr(e.message));
  useEffect(() => { if (view.name === 'list') load(); }, [view.name]);

  const act = async (fn) => { try { await fn(); load(); } catch (e) { setErr(e.message); } };

  if (view.name === 'edit') return <QuizEditor key={view.id || 'new'} id={view.id} onBack={() => setView({ name: 'list' })} />;
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Quizzes</h3><button onClick={() => setView({ name: 'edit' })}>+ New quiz</button></div>
      {err && <div className="err">{err}</div>}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Questions</th><th>Attempts</th>{user.role === 'ADMIN' && <th>Owner</th>}<th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td><td><span className={`badge ${r.status === 'PUBLISHED' ? '' : 'off'}`}>{r.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span></td><td>{r.questions}</td><td>{r.attempts}</td>
                {user.role === 'ADMIN' && <td>{r.owner}</td>}
                <td><div className="row">
                  <button className="secondary small" onClick={() => setView({ name: 'edit', id: r.id })}>Open</button>
                  <button className="secondary small" onClick={() => act(() => api(`/quizzes/${r.id}/clone`, { method: 'POST' }))}>Clone</button>
                  {r.attempts > 0 && <button className="secondary small" onClick={() => confirm(`Reset "${r.title}"? This permanently deletes all ${r.attempts} attempt(s), including in-progress work and results, and moves the quiz to draft. Questions, settings, and assignments will be kept.`) && act(() => api(`/quizzes/${r.id}/reset`, { method: 'POST' }))}>Reset attempts</button>}
                  <button className="danger small" onClick={() => confirm(`Delete "${r.title}" and all its data? This permanently deletes the quiz, its assignments, and all ${r.attempts} attempt(s). Shared question-bank questions will be kept.`) && act(() => api(`/quizzes/${r.id}`, { method: 'DELETE' }))}>Delete all</button>
                </div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="muted">No quizzes yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
