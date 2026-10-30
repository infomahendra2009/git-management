import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import ResultView from './ResultView.jsx';

const isAnswered = (a) => !!a && ((a.choice !== undefined) || (a.choices && a.choices.length > 0) || typeof a.value === 'boolean' || (a.text && a.text.trim() !== ''));
const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function QuestionView({ q, value, onChange }) {
  return (
    <div>
      <p style={{ whiteSpace: 'pre-wrap', fontSize: 17 }}>{q.text}</p>
      {q.imageUrl && <img className="thumb" style={{ maxHeight: 300 }} src={q.imageUrl} alt={q.imageAlt || ''} />}
      <div style={{ marginTop: 12 }}>
        {q.type === 'MULTIPLE_CHOICE' && q.options.map((o) => (
          <label key={o.key} className={`choice ${value?.choice === o.key ? 'sel' : ''}`}>
            <input type="radio" name={q.id} checked={value?.choice === o.key} onChange={() => onChange({ choice: o.key })} />
            <span>{o.text}{o.imageUrl && <img className="thumb" src={o.imageUrl} alt="" />}</span>
          </label>
        ))}
        {q.type === 'MULTIPLE_SELECT' && (
          <>
            <p className="muted">Select all that apply.</p>
            {q.options.map((o) => {
              const cur = value?.choices || [];
              const on = cur.includes(o.key);
              return (
                <label key={o.key} className={`choice ${on ? 'sel' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => {
                    const next = on ? cur.filter((k) => k !== o.key) : [...cur, o.key];
                    onChange(next.length ? { choices: next } : null);
                  }} />
                  <span>{o.text}{o.imageUrl && <img className="thumb" src={o.imageUrl} alt="" />}</span>
                </label>
              );
            })}
          </>
        )}
        {q.type === 'TRUE_FALSE' && [true, false].map((b) => (
          <label key={String(b)} className={`choice ${value?.value === b ? 'sel' : ''}`}>
            <input type="radio" name={q.id} checked={value?.value === b} onChange={() => onChange({ value: b })} />
            <span>{b ? 'True' : 'False'}</span>
          </label>
        ))}
        {q.type === 'ESSAY' && (
          <>
            <textarea style={{ minHeight: 220 }} value={value?.text || ''} placeholder="Write your answer here" maxLength={10000}
              onChange={(e) => onChange(e.target.value.trim() ? { text: e.target.value } : null)} />
            <div className="muted">{(value?.text || '').trim().split(/\s+/).filter(Boolean).length} words</div>
          </>
        )}
        {q.type === 'TEXT_INPUT' && (
          <textarea value={value?.text || ''} placeholder="Type your answer" maxLength={1000}
            onChange={(e) => onChange(e.target.value ? { text: e.target.value } : null)} />
        )}
      </div>
    </div>
  );
}

export default function TakeQuiz({ attemptId, onExit }) {
  const [data, setData] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState('');

  const offset = useRef(0);
  const timers = useRef({});
  const answersRef = useRef({});
  const flagsRef = useRef({});
  const enter = useRef({ qid: null, t: Date.now() });
  const submitting = useRef(false);

  useEffect(() => {
    api(`/student/attempts/${attemptId}`).then((r) => {
      if (r.status !== 'IN_PROGRESS') return setResult(r);
      offset.current = Date.parse(r.serverNow) - Date.now();
      const a = {}; const f = {};
      r.questions.forEach((q) => { a[q.id] = q.answer; f[q.id] = q.flagged; });
      answersRef.current = a; flagsRef.current = f;
      setAnswers(a); setFlags(f); setData(r);
      enter.current = { qid: r.questions[0]?.id, t: Date.now() };
    }).catch((e) => setErr(e.message));
  }, [attemptId]);

  const saveNow = async (qid) => {
    const spent = enter.current.qid === qid ? Math.round((Date.now() - enter.current.t) / 1000) : 0;
    if (enter.current.qid === qid) enter.current.t = Date.now();
    setSaveState('Saving…');
    try {
      await api(`/student/attempts/${attemptId}/answers/${qid}`, { method: 'PUT', body: { answer: answersRef.current[qid] ?? null, flagged: !!flagsRef.current[qid], spent } });
      setSaveState('Saved');
    } catch (e) {
      if (e.status === 409) { // already submitted (time ran out)
        const r = await api(`/student/attempts/${attemptId}`).catch(() => null);
        if (r) setResult(r);
      } else setSaveState('Not saved – check your connection');
    }
  };

  const flush = async () => {
    const pending = Object.keys(timers.current);
    pending.forEach((k) => clearTimeout(timers.current[k]));
    timers.current = {};
    await Promise.all(pending.map((k) => saveNow(k)));
  };

  const setAnswer = (q, value) => {
    answersRef.current = { ...answersRef.current, [q.id]: value };
    setAnswers(answersRef.current);
    clearTimeout(timers.current[q.id]);
    timers.current[q.id] = setTimeout(() => { delete timers.current[q.id]; saveNow(q.id); }, q.type === 'TEXT_INPUT' || q.type === 'ESSAY' ? 800 : 150);
  };

  const toggleFlag = (q) => {
    flagsRef.current = { ...flagsRef.current, [q.id]: !flagsRef.current[q.id] };
    setFlags(flagsRef.current);
    saveNow(q.id);
  };

  const doSubmit = async (auto = false) => {
    if (submitting.current) return;
    if (!auto) {
      const left = data.questions.filter((q) => !isAnswered(answersRef.current[q.id])).length;
      if (!confirm(left ? `${left} question(s) are unanswered. Submit anyway?` : 'Submit your answers now? You cannot change them afterwards.')) return;
    }
    submitting.current = true; setBusy(true);
    try {
      await flush();
      setResult(await api(`/student/attempts/${attemptId}/submit`, { method: 'POST' }));
    } catch (e) { setErr(e.message); submitting.current = false; } finally { setBusy(false); }
  };

  // Countdown from the server's clock; the server also enforces the deadline.
  useEffect(() => {
    if (!data?.deadlineAt || result) return;
    const tick = () => {
      const rem = Math.floor((Date.parse(data.deadlineAt) - (Date.now() + offset.current)) / 1000);
      setRemaining(Math.max(0, rem));
      if (rem <= 0) doSubmit(true);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [data, result]);

  const goTo = async (n) => {
    const cur = data.questions[idx];
    await saveNow(cur.id);
    enter.current = { qid: data.questions[n].id, t: Date.now() };
    setIdx(n);
  };

  if (err && !data && !result) return <div className="center"><div className="card"><div className="err">{err}</div><button onClick={onExit}>Back</button></div></div>;
  if (result) return <div className="container"><ResultView result={result} onBack={onExit} /></div>;
  if (!data) return <div className="center muted">Loading quiz…</div>;

  const { quiz, questions } = data;
  const answered = questions.filter((q) => isAnswered(answers[q.id])).length;
  const single = quiz.oneAtATime;
  const q = questions[idx];

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{quiz.title}</h3>
          {remaining !== null && <span className={`timer ${remaining < 60 ? 'low' : ''}`}>⏱ {fmt(remaining)}</span>}
        </div>
        {quiz.showProgress && (
          <>
            <div className="bar" style={{ marginTop: 10 }}><div style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
            <div className="muted">{answered} of {questions.length} answered {saveState && `· ${saveState}`}</div>
          </>
        )}
        {single && (
          <div className="palette">
            {questions.map((x, n) => (
              <button key={x.id} type="button" disabled={!quiz.allowReview && n !== idx}
                className={`pbtn ${isAnswered(answers[x.id]) ? 'done' : ''} ${flags[x.id] ? 'flag' : ''} ${n === idx ? 'cur' : ''}`}
                onClick={() => goTo(n)} aria-label={`Question ${n + 1}`}>{n + 1}</button>
            ))}
          </div>
        )}
      </div>

      {(single ? [q] : questions).map((x) => (
        <div className="card" key={x.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Question {x.position + 1} of {questions.length} <span className="muted">· {x.points} pt</span></strong>
            <button type="button" className="secondary small" onClick={() => toggleFlag(x)}>{flags[x.id] ? '⚑ Flagged' : '⚐ Flag for review'}</button>
          </div>
          <QuestionView q={x} value={answers[x.id]} onChange={(v) => setAnswer(x, v)} />
        </div>
      ))}

      {err && <div className="err">{err}</div>}
      <div className="row">
        {single && quiz.allowReview && <button className="secondary" disabled={idx === 0} onClick={() => goTo(idx - 1)}>← Previous</button>}
        {single && idx < questions.length - 1 && <button onClick={() => goTo(idx + 1)}>Next →</button>}
        <button className="danger" disabled={busy} onClick={() => doSubmit(false)}>Submit quiz</button>
      </div>
    </div>
  );
}
