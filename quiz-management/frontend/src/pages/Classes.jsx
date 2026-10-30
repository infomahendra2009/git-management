import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [sel, setSel] = useState(null);       // {id, name}
  const [students, setStudents] = useState([]);
  const [picked, setPicked] = useState(new Set());
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api('/classes').then((r) => setClasses(r.classes)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const loadStudents = (search = '') =>
    api(`/users?role=STUDENT${search ? `&q=${encodeURIComponent(search)}` : ''}`).then((r) => setStudents(r.users.filter((u) => u.isActive))).catch((e) => setErr(e.message));

  const create = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/classes', { method: 'POST', body: { name } }); setName(''); load(); } catch (e2) { setErr(e2.message); }
  };

  const open = async (c) => {
    setErr(''); setMsg('');
    const r = await api(`/classes/${c.id}`);
    setSel(c); setPicked(new Set(r.studentIds)); setQ(''); loadStudents();
  };

  const toggle = (id) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const save = async () => {
    setErr(''); setMsg('');
    try { const r = await api(`/classes/${sel.id}/members`, { method: 'PUT', body: { studentIds: [...picked] } }); setMsg(`Saved ${r.members} students.`); load(); }
    catch (e) { setErr(e.message); }
  };
  const remove = async (c) => {
    if (!confirm(`Delete class "${c.name}"? Students are not deleted.`)) return;
    try { await api(`/classes/${c.id}`, { method: 'DELETE' }); if (sel?.id === c.id) setSel(null); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <>
      <form className="card" onSubmit={create}>
        <h3>New class / batch</h3>
        <div className="row"><input placeholder="e.g. Class 10-A" value={name} onChange={(e) => setName(e.target.value)} required /><button>Create</button></div>
      </form>
      {err && <div className="card err">{err}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Class</th><th>Students</th><th>Owner</th><th></th></tr></thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}><td>{c.name}</td><td>{c.members}</td><td>{c.owner}</td>
                  <td><div className="row"><button className="secondary small" onClick={() => open(c)}>Manage students</button><button className="danger small" onClick={() => remove(c)}>Delete</button></div></td></tr>
              ))}
              {classes.length === 0 && <tr><td colSpan={4} className="muted">No classes yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <div className="card">
          <h3>Students in {sel.name} ({picked.size} selected)</h3>
          <div className="row">
            <input placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadStudents(q)} />
            <button className="secondary" onClick={() => loadStudents(q)}>Search</button>
          </div>
          <div className="listbox" style={{ marginTop: 10 }}>
            {students.map((s) => (
              <label key={s.id}><input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)} /> {s.name} <span className="muted">{s.userCode} · {s.email}</span></label>
            ))}
            {students.length === 0 && <span className="muted">No students found</span>}
          </div>
          {msg && <div className="ok">{msg}</div>}
          <div style={{ marginTop: 12 }}><button onClick={save}>Save members</button></div>
        </div>
      )}
    </>
  );
}
