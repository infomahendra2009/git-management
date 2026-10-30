import { useState } from 'react';
import { api } from '../api.js';

export default function ChangePassword({ onDone, onLogout }) {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }); onDone(); }
    catch (e2) { setErr(e2.message); }
  };

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h2>Set a new password</h2>
        <p className="muted">You must change your temporary password before continuing.</p>
        <label>Current (temporary) password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required />
        <label>New password (min 8 characters)</label>
        <input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} minLength={8} required />
        {err && <div className="err">{err}</div>}
        <div className="row" style={{ marginTop: 16 }}>
          <button>Save password</button>
          <button type="button" className="secondary" onClick={onLogout}>Logout</button>
        </div>
      </form>
    </div>
  );
}
