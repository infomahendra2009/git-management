import { useEffect, useState } from 'react';
import { api } from '../api.js';

const metaText = (m) => (m ? Object.entries(m).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : '');

export default function AuditLog() {
  const [actions, setActions] = useState([]);
  const [f, setF] = useState({ action: '', q: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pageSize: 50 });
  const [err, setErr] = useState('');

  useEffect(() => { api('/audit/actions').then((r) => setActions(r.actions)).catch(() => {}); }, []);
  const load = (p = page, filters = f) => {
    const params = new URLSearchParams({ page: p });
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api(`/audit?${params}`).then((r) => { setData(r); setErr(''); }).catch((e) => setErr(e.message));
  };
  useEffect(() => { load(page); }, [page]);

  const search = () => { setPage(1); load(1); };
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="card">
      <h3>Audit log</h3>
      <div className="row">
        <div><label>Action</label>
          <select value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}><option value="">All actions</option>{actions.map((a) => <option key={a}>{a}</option>)}</select></div>
        <div><label>Person (name, email or ID)</label><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && search()} /></div>
        <div><label>From</label><input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
        <div><label>To</label><input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
        <button onClick={search}>Filter</button>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>
            {data.items.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.actor ? `${r.actor} (${r.actorCode})` : <span className="muted">—</span>}</td>
                <td><span className={`badge ${/FAILED|LOCKED|BLOCKED/.test(r.action) ? 'off' : ''}`}>{r.action}</span></td>
                <td>{r.targetType || ''}</td>
                <td style={{ whiteSpace: 'normal', minWidth: 220 }} className="sub">{metaText(r.meta)}</td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan={5} className="muted">No entries</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <span className="muted">{data.total} entries · page {page} of {pages}</span>
        <button className="secondary small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <button className="secondary small" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
