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
  if (!quizzes) return <div className="card portal-loading">{err || 'Loading your quizzes…'}</div>;

  const activeCount = quizzes.filter((q) => q.inProgressAttemptId || q.canStart).length;
  const inProgressCount = quizzes.filter((q) => q.inProgressAttemptId).length;
  const completedCount = quizzes.reduce((count, q) => count + q.submitted.length, 0);

  return (
    <section className="student-quizzes-page">
      <div className="student-page-heading">
        <div><span className="eyebrow">YOUR ASSESSMENTS</span><h1>My quizzes</h1><p>Take your time, do your best, and keep moving forward.</p></div>
        <span className="heading-spark" aria-hidden="true">✦</span>
      </div>
      <div className="student-stats">
        <div className="student-stat"><span className="student-stat-icon">Q</span><span><strong>{quizzes.length}</strong><small>Assigned to you</small></span></div>
        <div className="student-stat"><span className="student-stat-icon accent-blue">↗</span><span><strong>{activeCount}</strong><small>Ready to take</small></span></div>
        <div className="student-stat"><span className="student-stat-icon accent-amber">◷</span><span><strong>{inProgressCount}</strong><small>In progress</small></span></div>
        <div className="student-stat"><span className="student-stat-icon accent-green">✓</span><span><strong>{completedCount}</strong><small>Submitted attempts</small></span></div>
      </div>
      {err && <div className="card err">{err}</div>}
      {quizzes.length === 0 && <div className="card empty-quizzes"><span className="empty-quiz-icon">✦</span><h2>You’re all caught up</h2><p>No quizzes have been assigned to you yet. Check back later.</p></div>}
      {quizzes.map((q) => (
        <article className={`card quiz-card ${q.inProgressAttemptId ? 'quiz-card-progress' : ''}`} key={q.id}>
          <div className="quiz-card-top">
            <span className={`quiz-status ${q.inProgressAttemptId ? 'status-progress' : q.window === 'UPCOMING' ? 'status-upcoming' : q.window === 'CLOSED' && !q.inProgressAttemptId ? 'status-closed' : q.canStart ? 'status-ready' : 'status-done'}`}>
              {q.inProgressAttemptId ? 'IN PROGRESS' : q.window === 'UPCOMING' ? 'COMING UP' : q.window === 'CLOSED' ? 'CLOSED' : q.canStart ? 'READY TO START' : 'COMPLETED'}
            </span>
            <span className="quiz-attempt-count">Attempt {q.attemptsUsed}/{q.attemptsAllowed}</span>
          </div>
          <div className="quiz-card-content">
            <div className="quiz-card-symbol" aria-hidden="true">✦</div>
            <div className="quiz-card-copy">
              <h2>{q.title}</h2>
              {q.description && <p className="quiz-description">{q.description}</p>}
              <div className="quiz-meta">
                <span><b>{q.questions}</b> questions</span><i>·</i>
                <span><b>{q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : 'Untimed'}</b></span>
                {q.startsAt && <><i>·</i><span>Opens {when(q.startsAt)}</span></>}
                {q.endsAt && <><i>·</i><span>Closes {when(q.endsAt)}</span></>}
              </div>
            </div>
            <div className="quiz-card-action">
              {q.inProgressAttemptId
                ? <button className="quiz-cta resume-cta" onClick={() => onTake(q.inProgressAttemptId)}>Resume quiz <span aria-hidden="true">→</span></button>
                : q.canStart && <button className="quiz-cta" onClick={() => start(q)}>{q.attemptsUsed ? 'Try again' : 'Start quiz'} <span aria-hidden="true">→</span></button>}
              {q.window === 'UPCOMING' && <span className="muted">Not open yet</span>}
              {q.window === 'CLOSED' && !q.inProgressAttemptId && <span className="muted">This quiz is closed</span>}
              {!q.canStart && q.window === 'OPEN' && !q.inProgressAttemptId && <span className="muted">No attempts remaining</span>}
            </div>
          </div>
          {q.submitted.length > 0 && (
            <details className="attempt-history">
              <summary>Attempt history <span>{q.submitted.length}</span></summary>
              <div className="table-wrap">
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
            </details>
          )}
        </article>
      ))}
    </section>
  );
}
