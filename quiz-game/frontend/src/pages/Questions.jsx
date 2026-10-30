import { useEffect, useState } from 'react';
import { api } from '../api.js';
import QuestionForm from './QuestionForm.jsx';
import ImportCsv from './ImportCsv.jsx';

const TYPE_LABEL = { MULTIPLE_CHOICE: 'Multiple choice', MULTIPLE_SELECT: 'Multiple select', TRUE_FALSE: 'True/False', TEXT_INPUT: 'Text input', ESSAY: 'Essay (manual)' };

export default function Questions({ user }) {
  const [view, setView] = useState({ name: 'list' }); // list | form | import
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [categories, setCategories] = useState([]);
  const [f, setF] = useState({ q: '', type: '', category: '', difficulty: '' });
  const [page, setPage] = useState(1);
  const [err, setErr] = useState('');

  const load = async (p = page) => {
    const params = new URLSearchParams({ page: p });
    Object.entries(f).forEach(([k, v]) => v && params.set(k, v));
    try {
      setData(await api(`/questions?${params}`));
      setCategories((await api('/questions/categories')).categories);
      setErr('');
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { if (view.name === 'list') load(); }, [view.name, page, f.type, f.category, f.difficulty]);

  const act = async (fn) => { try { await fn(); load(); } catch (e) { setErr(e.message); } };
  const remove = (r) => confirm('Delete this question?') && act(() => api(`/questions/${r.id}`, { method: 'DELETE' }));
  const dup = (r) => act(() => api(`/questions/${r.id}/duplicate`, { method: 'POST' }));

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const isAdmin = user.role === 'ADMIN';

  return (
    <>
      <div className="subtabs">
        <button className={view.name === 'list' ? '' : 'secondary'} onClick={() => setView({ name: 'list' })}>Question bank</button>
        <button className={view.name === 'form' && !view.id ? '' : 'secondary'} onClick={() => setView({ name: 'form' })}>+ New question</button>
        <button className={view.name === 'import' ? '' : 'secondary'} onClick={() => setView({ name: 'import' })}>CSV import / export</button>
      </div>

      {view.name === 'form' && (
        <QuestionForm key={view.id || 'new'} id={view.id} onDone={() => setView({ name: 'list' })} onCancel={() => setView({ name: 'list' })} />
      )}
      {view.name === 'import' && <ImportCsv onImported={() => setPage(1)} />}

      {view.name === 'list' && (
        <div className="card">
          <div className="row">
            <input placeholder="Search text or ID" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load(1))} />
            <select value={f.type} onChange={(e) => { setPage(1); setF({ ...f, type: e.target.value }); }}>
              <option value="">All types</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={f.category} onChange={(e) => { setPage(1); setF({ ...f, category: e.target.value }); }}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={f.difficulty} onChange={(e) => { setPage(1); setF({ ...f, difficulty: e.target.value }); }}>
              <option value="">Any difficulty</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
            </select>
            <button onClick={() => { setPage(1); load(1); }}>Search</button>
          </div>
          {err && <div className="err">{err}</div>}
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>ID</th><th>Question</th><th>Type</th><th>Category</th><th>Level</th><th>Pts</th>{isAdmin && <th>Owner</th>}<th></th></tr></thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.externalId || '—'}</td>
                    <td style={{ whiteSpace: 'normal', minWidth: 220 }}>{r.hasImage ? '🖼 ' : ''}{r.text || '(image question)'}</td>
                    <td>{TYPE_LABEL[r.type]}</td><td>{r.category || '—'}</td><td>{r.difficulty || '—'}</td><td>{r.points}</td>
                    {isAdmin && <td>{r.owner}</td>}
                    <td>
                      <div className="row">
                        <button className="secondary small" onClick={() => setView({ name: 'form', id: r.id })}>Edit</button>
                        <button className="secondary small" onClick={() => dup(r)}>Copy</button>
                        <button className="danger small" onClick={() => remove(r)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && <tr><td colSpan={8} className="muted">No questions yet. Add one or import a CSV.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <span className="muted">{data.total} questions · page {data.page} of {pages}</span>
            <button className="secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="secondary small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
