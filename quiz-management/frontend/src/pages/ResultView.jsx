const tfLabel = (v) => (v === true ? 'True' : v === false ? 'False' : '—');

export default function ResultView({ result, onBack }) {
  if (!result.resultVisible) {
    return (
      <div className="card">
        <h2>Submitted</h2>
        <p>Your answers for <strong>{result.quizTitle}</strong> were saved{result.autoSubmitted ? ' (time ran out, so it was submitted automatically)' : ''}.</p>
        <p className="muted">{result.awaitingGrading ? 'Some answers still need to be marked by your teacher. Your result will appear here once marking is finished and results are released.' : 'Your result will appear here when your teacher releases it.'}</p>
        {onBack && <button onClick={onBack}>Back to my quizzes</button>}
      </div>
    );
  }
  const chosen = (r, i) => r.yourAnswer && (r.yourAnswer.choice === String(i) || (r.yourAnswer.choices || []).includes(String(i)));
  return (
    <>
      <div className="card">
        <h2>{result.quizTitle} · Attempt {result.attemptNo}</h2>
        <div className="scorebox">{result.score} / {result.maxScore} <span className="muted" style={{ fontSize: 18 }}>({result.percent}%)</span></div>
        <div className={result.passed ? 'pill-ok' : 'pill-no'}>{result.passed ? 'Passed' : 'Not passed'} <span className="muted">(pass mark {result.passPercent}%)</span></div>
        {onBack && <p><button onClick={onBack}>Back to my quizzes</button></p>}
      </div>
      {result.review.map((r) => (
        <div className="card" key={r.position}>
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
    </>
  );
}
