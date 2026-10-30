import { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { name: '', email: '', phone: '', role: 'STUDENT' };

export default function Users({ canManage }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (roleFilter) params.set('role', roleFilter);
    try { setUsers((await api(`/users?${params}`)).users); } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, [roleFilter]);

  const create = async (e) => {
    e.preventDefault(); setErr(''); setNotice('');
    try {
      const r = await api('/users', { method: 'POST', body: form });
      setNotice(`Created ${r.user.name} (ID ${r.user.userCode}). Temporary password: ${r.tempPassword} — share it securely; it is shown only once.`);
      setForm(empty); load();
    } catch (e2) { setErr(e2.message); }
  };

  const toggle = async (u) => {
    setErr('');
    try { await api(`/users/${u.id}`, { method: 'PATCH', body: { isActive: !u.isActive } }); load(); }
    catch (e) { setErr(e.message); }
  };

  const unlock = async (u) => {
    try { await api(`/users/${u.id}/unlock`, { method: 'POST' }); load(); } catch (e) { setErr(e.message); }
  };

  const reset = async (u) => {
    if (!confirm(`Reset password for ${u.name}?`)) return;
    try {
      const r = await api(`/users/${u.id}/reset-password`, { method: 'POST' });
      setNotice(`New temporary password for ${u.name}: ${r.tempPassword}`);
    } catch (e) { setErr(e.message); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      {canManage && (
        <form className="card" onSubmit={create}>
          <h3>Add user</h3>
          <div className="row">
            <div><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
            <div><label>Phone (with country code)</label><input value={form.phone} onChange={set('phone')} placeholder="+919876543210" required /></div>
            <div>
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}><button>Create user</button></div>
        </form>
      )}

      {notice && <div className="card ok">{notice}</div>}
      {err && <div className="card err">{err}</div>}

      <div className="card">
        <div className="row">
          <input placeholder="Search name, email, phone, ID" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()} />
          {canManage && (
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          )}
          <button onClick={load}>Search</button>
        </div>

        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th>{canManage && <th></th>}</tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.userCode}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.isActive ? '' : 'off'}`}>{u.isActive ? 'Active' : 'Disabled'}</span>{u.lockedUntil && new Date(u.lockedUntil) > new Date() && <span className="badge off" style={{ marginLeft: 6 }}>Locked</span>}</td>
                  {canManage && (
                    <td>
                      <div className="row">
                        <button className="secondary" onClick={() => reset(u)}>Reset pw</button>
                        {u.lockedUntil && new Date(u.lockedUntil) > new Date() && <button onClick={() => unlock(u)}>Unlock</button>}
                        <button className={u.isActive ? 'danger' : ''} onClick={() => toggle(u)}>{u.isActive ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="muted">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
