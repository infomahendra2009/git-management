import { useEffect, useState } from 'react';
import { api } from '../api.js';

const when = (d) => (d ? new Date(d).toLocaleString() : '');

function Essay({ attemptId, e, onSaved }) {
  const [score, setScore] = useState(e.score ?? '');
  const [feedback, setFeedback] = useState(e.feedback || '');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const blank = !e.answerText.trim();

  const save = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const r = await api(`/grading/attempts/${attemptId}/questions/${e.id}`, { method: 'PUT', body: { score: Number(score), feedback } });
      setMsg(r.needsGrading ? `Saved. ${r.remaining} essay(s) left to mark.` : `Saved. All essays marked: total ${r.percent}% (${r.passed ? 'pass' : 'fail'}).`);
      onSaved();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <strong>Question {e.number} <span className="muted">· {e.points} points</span></strong>
        {e.gradedAt ? <span className="pill-ok">Marked: {e.score}/{e.points}</span> : blank ? <span className="muted">Left blank (0)</span> : <span className="pill-no">Needs marking</span>}
      </div>
      <p style={{ whiteSpace: 'pre-wrap' }}>{e.text}</p>
      {e.imageUrl && <img className="thumb" style={{ maxHeight: 200 }} src={e.imageUrl} alt="" />}
      {e.modelAnswer && <details><summary className="muted">Model answer / marking guide</summary><p style={{ whiteSpace: 'pre-wrap' }}>{e.modelAnswer}</p></details>}
      <label>Student's answer</label>
      <div className="listbox" style={{ whiteSpace: 'pre-wrap', maxHeight: 360, padding: 10 }}>{blank ? '(no answer)' : e.answerText}</div>
      {!blank && (
        <>
          <div className="row">
            <div><label>Score (0 to {e.points})</label><input type="number" min="0" max={e.points} step="0.25" value={score} onChange={(x) => setScore(x.target.value)} /></div>
          </div>
          <label>Feedback for the student (optional)</label>
          <textarea value={feedback} onChange={(x) => setFeedback(x.target.value)} />
          {msg && <div className="ok">{msg}</div>}{err && <div className="err">{err}</div>}
          <div style={{ marginTop: 10 }}><button disabled={busy || score === ''} onClick={save}>{e.gradedAt ? 'Update marks' : 'Save marks'}</button></div>
        </>
      )}
    </div>
  );
}

function Detail({ id, onBack }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api(`/grading/attempts/${id}`).then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  if (!d) return <div className="card muted">{err || 'Loading…'}</div>;
  const a = d.attempt;
  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{a.student} <span className="muted">{a.userCode} · {a.quiz} · attempt {a.attemptNo}</span></h3>
          <button className="secondary" onClick={onBack}>← Back to list</button>
        </div>
        <p className="muted">Submitted {when(a.submittedAt)} · auto-graded questions so far: {a.autoScore} points ·{' '}
          {a.needsGrading ? <span className="pill-no">still needs marking</span> : <span className="pill-ok">complete: {a.score}/{a.maxScore} ({a.percent}%)</span>}</p>
        <p className="muted">When every essay is marked the total is calculated. Students only see it after the result is released (Quizzes, then Results).</p>
      </div>
      {d.essays.map((e) => <Essay key={e.id} attemptId={id} e={e} onSaved={load} />)}
    </>
  );
}

export default function Grading() {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api(`/grading/queue?status=${status}`).then((r) => setRows(r.attempts)).catch((e) => setErr(e.message));
  useEffect(() => { if (!open) load(); }, [status, open]);

  if (open) return <Detail id={open} onBack={() => setOpen(null)} />;
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Essay marking</h3>
        <div className="row" style={{ flex: '0 0 auto' }}>
          <button className={status === 'pending' ? '' : 'secondary'} onClick={() => setStatus('pending')}>To mark</button>
          <button className={status === 'graded' ? '' : 'secondary'} onClick={() => setStatus('graded')}>Already marked</button>
        </div>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Student</th><th>ID</th><th>Quiz</th><th>Attempt</th><th>Submitted</th>{status === 'graded' && <th>Result</th>}<th></th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.student}</td><td>{a.userCode}</td><td>{a.quiz}</td><td>#{a.attemptNo}</td><td>{when(a.submittedAt)}</td>
                {status === 'graded' && <td>{a.percent}% {a.passed ? <span className="pill-ok">Pass</span> : <span className="pill-no">Fail</span>}</td>}
                <td><button className="secondary small" onClick={() => setOpen(a.id)}>{status === 'pending' ? 'Mark' : 'Review / change'}</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="muted">{status === 'pending' ? 'Nothing waiting to be marked.' : 'No marked essays yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
