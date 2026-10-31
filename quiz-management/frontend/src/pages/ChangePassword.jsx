import { useState } from 'react';
import { api } from '../api.js';

export default function ChangePassword({ onDone, onLogout, forced = false }) {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (newPassword !== confirmPassword) return setErr('New passwords do not match');
    setBusy(true);
    try { await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }); onDone(); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div className={forced ? 'center' : ''}>
      <form className="card" onSubmit={submit}>
        <h2>{forced ? 'Set a new password' : 'Change your password'}</h2>
        <p className="muted">{forced ? 'You must change your temporary password before continuing.' : 'Enter your current password, then choose a new one.'}</p>
        <label>{forced ? 'Current (temporary) password' : 'Current password'}</label>
        <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required />
        <label>New password (min 8 characters)</label>
        <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNew(e.target.value)} minLength={8} maxLength={100} required />
        <label>Confirm new password</label>
        <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} minLength={8} maxLength={100} required />
        {err && <div className="err">{err}</div>}
        <div className="row" style={{ marginTop: 16 }}>
          <button disabled={busy}>{busy ? 'Saving…' : forced ? 'Save password' : 'Update password'}</button>
          {forced
            ? <button type="button" className="secondary" onClick={onLogout}>Logout</button>
            : <button type="button" className="secondary" onClick={onDone}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
