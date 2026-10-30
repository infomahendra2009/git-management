import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const sevOptions = ['critical', 'high', 'medium', 'low'];
const statusOptions = ['pass', 'fail', 'blocked', 'not_executed'];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', feature: '', scenario: '', expected_result: '', severity: 'medium' });
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');

  // Guards against duplicate submits (double-click / slow network + repeat click).
  const [creating, setCreating] = useState(false);

  function load() {
    api.get(`/tasks/${id}`).then((res) => {
      setTask(res.data);
      const n = {};
      res.data.testCases.forEach((tc) => { n[tc.id] = tc.exec_comments || ''; });
      setNotes(n);
    });
  }

  useEffect(() => { load(); }, [id]);

  async function createCase(e) {
    e.preventDefault();
    if (creating) return;
    setError('');
    setCreating(true);
    try {
      await api.post('/test-cases', { task_id: id, ...form });
      setForm({ code: '', feature: '', scenario: '', expected_result: '', severity: 'medium' });
      setShowNew(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create test case.');
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(testCaseId, status) {
    await api.put(`/execution/${testCaseId}`, { status, comments: notes[testCaseId] || '' });
    load();
  }

  async function saveNote(testCaseId) {
    const tc = task.testCases.find((t) => t.id === testCaseId);
    await api.put(`/execution/${testCaseId}`, { status: tc.exec_status || 'not_executed', comments: notes[testCaseId] || '' });
  }

  async function markTaskDone() {
    await api.put(`/tasks/${id}`, { status: 'done' });
    load();
  }

  async function deleteTask() {
    if (!confirm(`Permanently delete task "${task.title}" and all its test cases?`)) return;
    await api.delete(`/tasks/${id}`);
    navigate(`/projects/${task.project_id}`);
  }

  if (!task) return <div className="empty-state">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to={`/projects/${task.project_id}`} style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>← Back to project</Link>
          <h1 style={{ marginTop: 6 }}>{task.title}</h1>
          <div className="sub">{task.description || 'No description.'} · <span className={`badge ${task.priority}`}>{task.priority}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowNew(true)}>+ Test case</button>
          {task.status !== 'done' && <button className="btn primary" onClick={markTaskDone}>Mark task done</button>}
          {isAdmin && <button className="btn danger" onClick={deleteTask}>Delete task</button>}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Code</th>
              <th style={{ width: 100 }}>Severity</th>
              <th>Scenario</th>
              <th>Expected Result</th>
              <th style={{ width: 190 }}>Status</th>
              <th style={{ width: 160 }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {task.testCases.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state">No test cases yet — add one above.</div></td></tr>
            )}
            {task.testCases.map((tc) => (
              <tr key={tc.id}>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)' }}>{tc.code || `#${tc.id}`}</td>
                <td><span className={`badge ${tc.severity}`}>{tc.severity}</span></td>
                <td style={{ fontWeight: 600 }}>{tc.scenario}</td>
                <td style={{ color: 'var(--ink-dim)', fontSize: 12.5 }}>{tc.expected_result}</td>
                <td>
                  <select
                    value={tc.exec_status || 'not_executed'}
                    onChange={(e) => setStatus(tc.id, e.target.value)}
                    style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--rule)', fontSize: 12 }}
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid var(--rule)', fontSize: 12 }}
                    placeholder="Add note…"
                    value={notes[tc.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [tc.id]: e.target.value })}
                    onBlur={() => saveNote(tc.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => !creating && setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New test case</h2>
            <form onSubmit={createCase}>
              <div className="form-row">
                <div className="field">
                  <label>Code</label>
                  <input placeholder="e.g. HM-030" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={creating} />
                </div>
                <div className="field">
                  <label>Feature</label>
                  <input value={form.feature} onChange={(e) => setForm({ ...form, feature: e.target.value })} disabled={creating} />
                </div>
              </div>
              <div className="field">
                <label>Scenario</label>
                <textarea value={form.scenario} onChange={(e) => setForm({ ...form, scenario: e.target.value })} required disabled={creating} />
              </div>
              <div className="field">
                <label>Expected result</label>
                <textarea value={form.expected_result} onChange={(e) => setForm({ ...form, expected_result: e.target.value })} disabled={creating} />
              </div>
              <div className="field">
                <label>Severity</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} disabled={creating}>
                  {sevOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowNew(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="btn primary" disabled={creating}>
                  {creating ? 'Adding…' : 'Add test case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
