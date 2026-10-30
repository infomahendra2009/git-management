import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ResultView from './ResultView.jsx';

const when = (d) => (d ? new Date(d).toLocaleString() : '');

export default function StudentQuizzes({ onTake }) {
  const [quizzes, setQuizzes] = useState(null);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const load = () => api('/student/quizzes').then((r) => setQuizzes(r.quizzes)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const start = async (q) => {
    setErr('');
    try { onTake((await api(`/student/quizzes/${q.id}/start`, { method: 'POST' })).attemptId); }
    catch (e) { setErr(e.message); load(); }
  };
  const view = async (a) => {
    try { setResult(await api(`/student/attempts/${a.id}`)); } catch (e) { setErr(e.message); }
  };

  if (result) return <ResultView result={result} onBack={() => { setResult(null); load(); }} />;
  if (!quizzes) return <div className="card muted">{err || 'Loading…'}</div>;

  return (
    <>
      {err && <div className="card err">{err}</div>}
      {quizzes.length === 0 && <div className="card muted">No quizzes have been assigned to you yet.</div>}
      {quizzes.map((q) => (
        <div className="card" key={q.id}>
          <h3>{q.title}</h3>
          {q.description && <p style={{ whiteSpace: 'pre-wrap' }}>{q.description}</p>}
          <p className="muted">
            {q.questions} questions · {q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : 'no time limit'} · attempts {q.attemptsUsed}/{q.attemptsAllowed}
            {q.startsAt && ` · opens ${when(q.startsAt)}`}{q.endsAt && ` · closes ${when(q.endsAt)}`}
          </p>
          {q.window === 'UPCOMING' && <p className="muted">Not open yet.</p>}
          {q.window === 'CLOSED' && !q.inProgressAttemptId && <p className="muted">Closed.</p>}
          {q.inProgressAttemptId
            ? <button onClick={() => onTake(q.inProgressAttemptId)}>Resume quiz</button>
            : q.canStart && <button onClick={() => start(q)}>{q.attemptsUsed ? 'Start another attempt' : 'Start quiz'}</button>}
          {q.submitted.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table>
                <thead><tr><th>Attempt</th><th>Submitted</th><th>Result</th><th></th></tr></thead>
                <tbody>
                  {q.submitted.map((a) => (
                    <tr key={a.id}>
                      <td>#{a.attemptNo}</td><td>{when(a.submittedAt)}</td>
                      <td>{a.resultVisible ? <>{a.score}/{a.maxScore} ({a.percent}%) <span className={a.passed ? 'pill-ok' : 'pill-no'}>{a.passed ? 'Passed' : 'Not passed'}</span></> : <span className="muted">{a.awaitingGrading ? 'Submitted, awaiting grading' : 'Submitted, awaiting release'}</span>}</td>
                      <td>{a.resultVisible && <button className="secondary small" onClick={() => view(a)}>View</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
