import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const empty = { name: '', email: '', phone: '', role: 'STUDENT' };

export default function Users({ canManage, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState(empty);
  const [classId, setClassId] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editBusy, setEditBusy] = useState(false);
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [resetBusy, setResetBusy] = useState(false);
  const confirmResetRef = useRef(null);

  useEffect(() => {
    if (!resetTarget) return undefined;
    confirmResetRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !resetBusy) setResetTarget(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resetTarget, resetBusy]);

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (roleFilter) params.set('role', roleFilter);
    try { setUsers((await api(`/users?${params}`)).users); setSelectedIds([]); } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, [roleFilter]);
  useEffect(() => {
    if (!canManage) return;
    api('/classes').then((result) => setClasses(result.classes || [])).catch((e) => setErr(e.message));
  }, [canManage]);

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

  const uploadCsv = async (e) => {
    e.preventDefault();
    if (!csvFile || !classId) return setErr('Choose a CSV file and class');
    const formElement = e.currentTarget;
    setErr(''); setNotice(''); setCredentials([]); setImportErrors([]); setCsvBusy(true);
    const body = new FormData();
    body.append('csv', csvFile);
    body.append('classId', classId);
    try {
      const result = await api('/users/bulk-csv', { method: 'POST', body });
      setCredentials(result.users);
      setNotice(`Created ${result.created} students and added them to the selected class. Temporary passwords are shown below once.`);
      setCsvFile(null);
      formElement.reset();
      load();
    } catch (error) { setErr(error.message); setImportErrors(error.details || []); }
    finally { setCsvBusy(false); }
  };

  const downloadCsvTemplate = () => {
    const blob = new Blob(['name,email,phone,userCode\nAarav Sharma,aarav@example.com,+919876543210,\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSelectedStatus = async (isActive) => {
    setErr('');
    try {
      const result = await api('/users/bulk-status', { method: 'PATCH', body: { userIds: selectedIds, isActive } });
      setNotice(`${result.updated} user${result.updated === 1 ? '' : 's'} ${isActive ? 'activated' : 'deactivated'}.`);
      setSelectedIds([]);
      load();
    } catch (error) { setErr(error.message); }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setErr(''); setEditBusy(true);
    try {
      await api(`/users/${editTarget.id}`, { method: 'PATCH', body: editForm });
      setNotice(`Updated ${editForm.name}'s details.`);
      setEditTarget(null);
      load();
    } catch (error) { setErr(error.message); }
    finally { setEditBusy(false); }
  };

  const unlock = async (u) => {
    try { await api(`/users/${u.id}/unlock`, { method: 'POST' }); load(); } catch (e) { setErr(e.message); }
  };

  const reset = async () => {
    if (!resetTarget || resetBusy) return;
    setErr('');
    setNotice('');
    setResetBusy(true);
    try {
      const r = await api(`/users/${resetTarget.id}/reset-password`, { method: 'POST' });
      setNotice(`New temporary password for ${resetTarget.name}: ${r.tempPassword} — share it securely; it is shown only once. The user must change it after signing in.`);
      setResetTarget(null);
    } catch (e) { setErr(e.message); }
    finally { setResetBusy(false); }
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

      {canManage && (
        <form className="card" onSubmit={uploadCsv}>
          <h3>Bulk create students from CSV</h3>
          <p className="muted">Required columns: name, email, phone. Optional: userCode. All rows must be valid; uploads are limited to 500 students.</p>
          <div className="row">
            <div>
              <label htmlFor="student-class">Add students to class</label>
              <select id="student-class" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                <option value="">Choose a class</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="students-csv">Student CSV file</label>
              <input id="students-csv" type="file" accept=".csv,text/csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} required />
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button type="submit" disabled={csvBusy || !classes.length}>{csvBusy ? 'Importing students…' : 'Upload and create students'}</button>
            <button type="button" className="secondary" onClick={downloadCsvTemplate}>Download CSV template</button>
          </div>
        </form>
      )}

      {credentials.length > 0 && (
        <section className="card" aria-live="polite">
          <h3>Temporary student passwords</h3>
          <p className="muted">Save these credentials now. Passwords are only displayed for this upload and students must change them at first sign-in.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>User ID</th><th>Temporary password</th></tr></thead>
              <tbody>{credentials.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.userCode}</td><td><code>{user.tempPassword}</code></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {notice && <div className="card ok">{notice}</div>}
      {err && <div className="card err">{err}</div>}
      {importErrors.length > 0 && (
        <div className="card err" role="alert">
          <strong>CSV rows to fix</strong>
          <ul>{importErrors.map((item, index) => <li key={`${item.row}-${index}`}>Row {item.row}: {item.message}</li>)}</ul>
        </div>
      )}

      {editTarget && (
        <form className="card" onSubmit={saveEdit}>
          <h3>Edit {editTarget.userCode}</h3>
          <div className="row">
            <div><label htmlFor="edit-user-name">Name</label><input id="edit-user-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} minLength={2} maxLength={120} required /></div>
            <div><label htmlFor="edit-user-phone">Mobile number</label><input id="edit-user-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required /></div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button disabled={editBusy}>{editBusy ? 'Saving…' : 'Save details'}</button>
            <button type="button" className="secondary" onClick={() => setEditTarget(null)} disabled={editBusy}>Cancel</button>
          </div>
        </form>
      )}

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

        {canManage && (
          <div className="row" style={{ marginTop: 12 }}>
            <span className="muted">{selectedIds.length} selected</span>
            <button type="button" disabled={!selectedIds.length} onClick={() => updateSelectedStatus(true)}>Activate selected</button>
            <button type="button" className="danger" disabled={!selectedIds.length} onClick={() => updateSelectedStatus(false)}>Deactivate selected</button>
          </div>
        )}

        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>{canManage && <th><input type="checkbox" aria-label="Select all eligible users" checked={users.filter((u) => u.id !== currentUserId).length > 0 && users.filter((u) => u.id !== currentUserId).every((u) => selectedIds.includes(u.id))} onChange={(e) => setSelectedIds(e.target.checked ? users.filter((u) => u.id !== currentUserId).map((u) => u.id) : [])} /></th>}<th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th>{canManage && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  {canManage && <td><input type="checkbox" aria-label={`Select ${u.name}`} disabled={u.id === currentUserId} checked={selectedIds.includes(u.id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds, u.id] : selectedIds.filter((id) => id !== u.id))} /></td>}
                  <td>{u.userCode}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                  <td>{u.role}</td>
                  <td><span className={`badge ${u.isActive ? '' : 'off'}`}>{u.isActive ? 'Active' : 'Disabled'}</span>{u.lockedUntil && new Date(u.lockedUntil) > new Date() && <span className="badge off" style={{ marginLeft: 6 }}>Locked</span>}</td>
                  {canManage && (
                    <td>
                      <div className="row">
                        <button className="secondary" onClick={() => { setEditTarget(u); setEditForm({ name: u.name, phone: u.phone || '' }); }}>Edit details</button>
                        <button className="secondary" onClick={() => { setErr(''); setResetTarget(u); }}>Reset pw</button>
                        {u.lockedUntil && new Date(u.lockedUntil) > new Date() && <button onClick={() => unlock(u)}>Unlock</button>}
                        <button className={u.isActive ? 'danger' : ''} disabled={u.id === currentUserId} onClick={() => toggle(u)}>{u.isActive ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={canManage ? 8 : 6} className="muted">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {resetTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !resetBusy) setResetTarget(null);
          }}
        >
          <section
            aria-labelledby="reset-password-title"
            aria-describedby="reset-password-description"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            role="dialog"
            tabIndex={-1}
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-xl text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden="true">!</div>
            <h2 className="mb-2 text-xl font-bold" id="reset-password-title">Reset this user’s password?</h2>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-300">
              You’re about to reset the password for <strong>{resetTarget.name}</strong>.
            </p>
            <p className="mb-6 text-sm leading-6 text-slate-500 dark:text-slate-400" id="reset-password-description">
              A new temporary password will be generated. The current password will stop working, and the user will have to choose a new password the next time they sign in.
            </p>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="secondary"
                disabled={resetBusy}
                onClick={() => setResetTarget(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="danger"
                disabled={resetBusy}
                onClick={reset}
                ref={confirmResetRef}
                type="button"
              >
                {resetBusy ? 'Resetting password…' : 'Yes, reset password'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
