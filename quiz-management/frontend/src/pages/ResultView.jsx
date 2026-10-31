const tfLabel = (v) => (v === true ? 'True' : v === false ? 'False' : '—');

export default function ResultView({ result, onBack }) {
  if (!result.resultVisible) {
    return (
      <div className="card result-pending">
        <span className="result-icon pending-icon">◷</span>
        <span className="eyebrow">ASSESSMENT COMPLETE</span>
        <h2>Submission received</h2>
        <p>Your answers for <strong>{result.quizTitle}</strong> were saved{result.autoSubmitted ? ' (time ran out, so it was submitted automatically)' : ''}.</p>
        <p className="muted">{result.awaitingGrading ? 'Some answers still need to be marked by your teacher. Your result will appear here once marking is finished and results are released.' : 'Your result will appear here when your teacher releases it.'}</p>
        {onBack && <button onClick={onBack}>Back to my quizzes</button>}
      </div>
    );
  }
  const chosen = (r, i) => r.yourAnswer && (r.yourAnswer.choice === String(i) || (r.yourAnswer.choices || []).includes(String(i)));
  return (
    <section className="result-page">
      <div className="card result-hero">
        <span className="eyebrow">ASSESSMENT RESULTS · ATTEMPT {result.attemptNo}</span>
        <h1>{result.quizTitle}</h1>
        <div className="result-score-row">
          <div className="scorebox">{result.score}<span> / {result.maxScore}</span></div>
          <div className={`result-status ${result.passed ? 'result-passed' : 'result-failed'}`}>{result.passed ? 'Passed' : 'Keep practicing'}<small>{result.percent}% score · pass mark {result.passPercent}%</small></div>
        </div>
        <div className="result-meter"><div className={result.passed ? 'meter-passed' : 'meter-failed'} style={{ width: `${Math.min(100, Math.max(0, result.percent || 0))}%` }} /></div>
        {onBack && <p><button onClick={onBack}>Back to my quizzes</button></p>}
      </div>
      {result.review.map((r) => (
        <div className="card result-question-card" key={r.position}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Question {r.position}</strong>
            <span className={r.type === 'ESSAY' ? 'muted' : r.isCorrect ? 'pill-ok' : r.answered ? 'pill-no' : 'muted'}>
              {r.answered ? (r.type === 'ESSAY' ? 'Marked' : r.isCorrect ? 'Correct' : 'Incorrect') : 'Not answered'} · {r.score ?? 0}/{r.points}
            </span>
          </div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.text}</p>
          {r.imageUrl && <img className="thumb" style={{ maxHeight: 220 }} src={r.imageUrl} alt={r.imageAlt || ''} />}
          {(r.type === 'MULTIPLE_CHOICE' || r.type === 'MULTIPLE_SELECT') && r.options.map((o, i) => (
            <div key={i} className={`choice ${o.isCorrect ? 'good' : chosen(r, i) ? 'bad' : ''}`} style={{ cursor: 'default' }}>
              <span>{chosen(r, i) ? '● ' : '○ '}{o.text}{o.imageUrl && <img className="thumb" src={o.imageUrl} alt="" />}</span>
              {o.isCorrect && <span className="pill-ok" style={{ marginLeft: 'auto' }}>✔ correct</span>}
            </div>
          ))}
          {r.type === 'TRUE_FALSE' && (
            <p>Your answer: <strong>{tfLabel(r.yourAnswer?.value)}</strong>{r.correctValue !== undefined && <> · Correct: <strong>{tfLabel(r.correctValue)}</strong></>}</p>
          )}
          {r.type === 'ESSAY' && (
            <>
              <p className="muted" style={{ marginBottom: 4 }}>Your answer:</p>
              <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 8px' }}>{r.yourAnswer?.text || '—'}</p>
              {r.feedback && <p><strong>Teacher feedback:</strong> {r.feedback}</p>}
            </>
          )}
          {r.type === 'TEXT_INPUT' && (
            <p>Your answer: <strong>{r.yourAnswer?.text || '—'}</strong>{r.acceptedAnswers && <> · Accepted: <strong>{r.acceptedAnswers.join(', ')}</strong></>}</p>
          )}
          {r.explanation && <p className="muted"><strong>Explanation:</strong> {r.explanation}</p>}
        </div>
      ))}
    </section>
  );
}
