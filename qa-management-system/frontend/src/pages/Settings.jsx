import React, { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [appSettings, setAppSettings] = useState({ company_name: '' });
  const [showNewUser, setShowNewUser] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'qa' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function load() {
    api.get('/settings/users').then((res) => setUsers(res.data));
    api.get('/settings/app').then((res) => setAppSettings({ company_name: res.data.company_name || '' }));
  }

  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/settings/users', form);
      setForm({ name: '', email: '', password: '', role: 'qa' });
      setShowNewUser(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create user.');
    }
  }

  async function removeUser(id) {
    if (!confirm('Remove this user?')) return;
    await api.delete(`/settings/users/${id}`);
    load();
  }

  async function toggleRole(u) {
    await api.put(`/settings/users/${u.id}/role`, { role: u.role === 'admin' ? 'qa' : 'admin' });
    load();
  }

  async function saveAppSettings(e) {
    e.preventDefault();
    await api.put('/settings/app', appSettings);
    setNotice('Saved.');
    setTimeout(() => setNotice(''), 2000);
  }

  async function changePassword(e) {
    e.preventDefault();
    setError(''); setNotice('');
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      setNotice('Password updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not change password.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <div className="sub">Users, roles, and application preferences.</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="badge published" style={{ marginBottom: 12 }}>{notice}</div>}

      <div className="section-label">
        User management
        <button className="btn small" onClick={() => setShowNewUser(true)}>+ New user</button>
      </div>
      <div className="table-wrap" style={{ marginBottom: 8 }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th style={{ width: 100 }}>Role</th><th style={{ width: 140 }}></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'published' : 'pending'}`}>{u.role}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn small" onClick={() => toggleRole(u)}>Toggle role</button>
                  {u.id !== user.id && <button className="btn small danger" onClick={() => removeUser(u.id)}>Remove</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-label">Application settings</div>
      <div className="card" style={{ marginBottom: 24, maxWidth: 420 }}>
        <form onSubmit={saveAppSettings}>
          <div className="field">
            <label>Company name (shown on the public dashboard)</label>
            <input value={appSettings.company_name} onChange={(e) => setAppSettings({ ...appSettings, company_name: e.target.value })} />
          </div>
          <button className="btn primary" type="submit">Save</button>
        </form>
      </div>

      <div className="section-label">Your profile</div>
      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={changePassword}>
          <div className="field">
            <label>Current password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button className="btn primary" type="submit">Change password</button>
        </form>
      </div>

      {showNewUser && (
        <div className="modal-overlay" onClick={() => setShowNewUser(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New user</h2>
            <form onSubmit={createUser}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Temporary password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="qa">QA</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowNewUser(false)}>Cancel</button>
                <button type="submit" className="btn primary">Create user</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
