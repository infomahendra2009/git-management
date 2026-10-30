import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageField from './ImageField.jsx';

const blankOpt = (isCorrect = false) => ({ text: '', imageUrl: '', isCorrect });
const blank = () => ({
  type: 'MULTIPLE_CHOICE', text: '', imageUrl: '', imageAlt: '', points: 1, explanation: '', category: '',
  difficulty: '', timeLimit: '', shuffleOptions: false, partialScoring: false, caseSensitive: false,
  matchMode: 'EXACT', options: [blankOpt(true), blankOpt(), blankOpt(), blankOpt()], tfAnswer: true, acceptedText: '',
});

export default function QuestionForm({ id, onDone, onCancel }) {
  const [q, setQ] = useState(blank());
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    api(`/questions/${id}`).then(({ question: s }) => {
      setQ({
        ...blank(), ...s,
        imageUrl: s.imageUrl || '', imageAlt: s.imageAlt || '', explanation: s.explanation || '', category: s.category || '',
        difficulty: s.difficulty || '', timeLimit: s.timeLimit ?? '',
        options: s.options.length ? s.options.map((o) => ({ ...o, imageUrl: o.imageUrl || '' })) : blank().options,
        tfAnswer: s.tfAnswer ?? true, acceptedText: (s.acceptedAnswers || []).join('\n'),
      });
    }).catch((e) => setErrors([e.message])).finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setQ((p) => ({ ...p, [k]: v }));
  const setOpt = (i, patch) => setQ((p) => ({ ...p, options: p.options.map((o, n) => (n === i ? { ...o, ...patch } : o)) }));
  const isChoice = q.type === 'MULTIPLE_CHOICE' || q.type === 'MULTIPLE_SELECT';

  const changeType = (type) => setQ((p) => {
    let options = p.options;
    if (type === 'MULTIPLE_CHOICE') { // keep only the first correct option
      let seen = false;
      options = options.map((o) => { const c = o.isCorrect && !seen; if (o.isCorrect) seen = true; return { ...o, isCorrect: c }; });
    }
    return { ...p, type, options };
  });

  const markCorrect = (i, checked) => setQ((p) => ({
    ...p,
    options: p.options.map((o, n) => (p.type === 'MULTIPLE_CHOICE' ? { ...o, isCorrect: n === i } : n === i ? { ...o, isCorrect: checked } : o)),
  }));

  const submit = async (e) => {
    e.preventDefault(); setErrors([]); setBusy(true);
    const body = {
      type: q.type, text: q.text, imageUrl: q.imageUrl, imageAlt: q.imageAlt, points: Number(q.points),
      explanation: q.explanation, category: q.category, difficulty: q.difficulty, timeLimit: q.timeLimit === '' ? '' : Number(q.timeLimit),
      shuffleOptions: q.shuffleOptions, partialScoring: q.partialScoring, caseSensitive: q.caseSensitive, matchMode: q.matchMode,
      options: isChoice ? q.options : [], tfAnswer: q.type === 'TRUE_FALSE' ? q.tfAnswer : null,
      acceptedAnswers: q.type === 'TEXT_INPUT' ? q.acceptedText.split('\n') : [],
    };
    try {
      await api(id ? `/questions/${id}` : '/questions', { method: id ? 'PUT' : 'POST', body });
      onDone();
    } catch (e2) { setErrors(e2.details || [e2.message]); } finally { setBusy(false); }
  };

  if (loading) return <div className="card muted">Loading…</div>;

  return (
    <form className="card" onSubmit={submit}>
      <h3>{id ? 'Edit question' : 'New question'}</h3>

      <label>Question type</label>
      <select value={q.type} onChange={(e) => changeType(e.target.value)}>
        <option value="MULTIPLE_CHOICE">Multiple choice (one answer)</option>
        <option value="MULTIPLE_SELECT">Multiple select (several answers)</option>
        <option value="TRUE_FALSE">True / False</option>
        <option value="TEXT_INPUT">Text input / fill in the blank</option>
        <option value="ESSAY">Essay (marked by a teacher)</option>
      </select>

      <label>Question text</label>
      <textarea value={q.text} onChange={(e) => set('text', e.target.value)} placeholder="Type the question (or add an image instead)" />
      <ImageField label="Question image (optional)" url={q.imageUrl} onUrl={(v) => set('imageUrl', v)} alt={q.imageAlt} onAlt={(v) => set('imageAlt', v)} />

      {isChoice && (
        <>
          <label>Options (tick the correct {q.type === 'MULTIPLE_CHOICE' ? 'one' : 'ones'})</label>
          {q.options.map((o, i) => (
            <div className="opt" key={i}>
              <input type={q.type === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'} style={{ width: 'auto', marginTop: 12 }}
                checked={o.isCorrect} onChange={(e) => markCorrect(i, e.target.checked)} aria-label={`Option ${i + 1} is correct`} />
              <div className="grow">
                <input placeholder={`Option ${i + 1}`} value={o.text} onChange={(e) => setOpt(i, { text: e.target.value })} />
                <ImageField label="" url={o.imageUrl} onUrl={(v) => setOpt(i, { imageUrl: v })} />
              </div>
              {q.options.length > 2 && (
                <button type="button" className="secondary small" onClick={() => set('options', q.options.filter((_, n) => n !== i))}>✕</button>
              )}
            </div>
          ))}
          {q.options.length < 10 && (
            <button type="button" className="secondary small" onClick={() => set('options', [...q.options, blankOpt()])}>+ Add option</button>
          )}
          <label className="check"><input type="checkbox" checked={q.shuffleOptions} onChange={(e) => set('shuffleOptions', e.target.checked)} /> Shuffle options for each student</label>
          {q.type === 'MULTIPLE_SELECT' && (
            <label className="check"><input type="checkbox" checked={q.partialScoring} onChange={(e) => set('partialScoring', e.target.checked)} /> Give partial marks</label>
          )}
        </>
      )}

      {q.type === 'TRUE_FALSE' && (
        <>
          <label>Correct answer</label>
          <select value={String(q.tfAnswer)} onChange={(e) => set('tfAnswer', e.target.value === 'true')}>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </>
      )}

      {q.type === 'TEXT_INPUT' && (
        <>
          <label>Accepted answers (one per line)</label>
          <textarea value={q.acceptedText} onChange={(e) => set('acceptedText', e.target.value)} />
          <div className="row">
            <div>
              <label>Matching</label>
              <select value={q.matchMode} onChange={(e) => set('matchMode', e.target.value)}>
                <option value="EXACT">Exact match</option>
                <option value="CONTAINS">Answer contains the text</option>
              </select>
            </div>
          </div>
          <label className="check"><input type="checkbox" checked={q.caseSensitive} onChange={(e) => set('caseSensitive', e.target.checked)} /> Case sensitive</label>
        </>
      )}

      {q.type === 'ESSAY' && <p className="muted">Students type a long answer and a teacher marks it by hand in the Grading tab. Put a model answer or marking guide in the box at the bottom.</p>}

      <div className="row">
        <div><label>Points</label><input type="number" step="0.25" min="0.25" value={q.points} onChange={(e) => set('points', e.target.value)} required /></div>
        <div><label>Category</label><input value={q.category} onChange={(e) => set('category', e.target.value)} /></div>
        <div>
          <label>Difficulty</label>
          <select value={q.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value="">—</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
          </select>
        </div>
        <div><label>Time limit (seconds, optional)</label><input type="number" min="1" value={q.timeLimit} onChange={(e) => set('timeLimit', e.target.value)} /></div>
      </div>

      <label>{q.type === 'ESSAY' ? 'Model answer / marking guide (shown to students after release, if the quiz shows explanations)' : 'Explanation (shown after answering, optional)'}</label>
      <textarea value={q.explanation} onChange={(e) => set('explanation', e.target.value)} />

      {errors.length > 0 && <ul className="err">{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>}
      <div className="row" style={{ marginTop: 16 }}>
        <button disabled={busy}>{id ? 'Save changes' : 'Create question'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
