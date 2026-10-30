import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
];

export default function ReleaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [release, setRelease] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const [showNewTask, setShowNewTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  // Guards against duplicate submits (double-click / slow network + repeat click)
  // which was creating the same task more than once under a release.
  const [creatingTask, setCreatingTask] = useState(false);

  const isClosed = release?.status === 'closed';

  function load() {
    api.get(`/releases/${id}`).then((res) => setRelease(res.data));
  }

  useEffect(() => { load(); setStatusFilter('all'); }, [id]);

  async function publish() {
    setError('');
    try {
      await api.post(`/reports/release/${id}/publish`);
      await api.post(`/releases/${id}/publish`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not publish release.');
    }
  }

  async function close() {
    if (!confirm('Close this release? Tasks stay visible below, but no new tasks can be added afterward.')) return;
    await api.post(`/releases/${id}/close`);
    load();
  }

  async function deleteRelease() {
    if (!confirm(`Permanently delete release ${release.version}? Its tasks will remain but become unassigned from a release.`)) return;
    await api.delete(`/releases/${id}`);
    navigate(`/projects/${release.project_id}`);
  }

  async function deleteTask(e, taskId, taskTitle) {
    e.stopPropagation();
    if (!confirm(`Permanently delete task "${taskTitle}" and all its test cases?`)) return;
    await api.delete(`/tasks/${taskId}`);
    load();
  }

  async function createTask(e) {
    e.preventDefault();
    if (creatingTask) return; // already in flight — ignore extra clicks/submits
    setError('');
    setCreatingTask(true);
    try {
      await api.post('/tasks', { project_id: release.project_id, release_id: id, title: taskTitle, priority: taskPriority });
      setTaskTitle(''); setShowNewTask(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create task.');
    } finally {
      setCreatingTask(false);
    }
  }

  const counts = useMemo(() => {
    const c = { all: 0, todo: 0, in_progress: 0, done: 0 };
    (release?.tasks || []).forEach((t) => { c.all++; c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [release]);

  const visibleTasks = useMemo(() => {
    if (!release) return [];
    if (statusFilter === 'all') return release.tasks;
    return release.tasks.filter((t) => t.status === statusFilter);
  }, [release, statusFilter]);

  if (!release) return <div className="empty-state">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to={`/projects/${release.project_id}`} style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>← Back to project</Link>
          <h1 style={{ marginTop: 6 }}>Release {release.version}</h1>
          <div className="sub"><span className={`badge ${release.status}`}>{release.status}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => navigate(`/reports?release_id=${id}`)}>View report</button>
          {release.status === 'draft' && <button className="btn primary" onClick={publish}>Publish report</button>}
          {release.status === 'published' && <button className="btn danger" onClick={close}>Close release</button>}
          {isAdmin && <button className="btn danger" onClick={deleteRelease}>Delete release</button>}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {isClosed && (
        <div className="badge closed" style={{ marginBottom: 14, display: 'inline-flex' }}>
          Release closed — tasks below are shown for reference; new tasks can no longer be added.
        </div>
      )}

      <div className="section-label">
        Tasks in this release
        {!isClosed && <button className="btn small" onClick={() => setShowNewTask(true)}>+ New task</button>}
      </div>

      <div className="toolbar">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            className={`pill-btn ${statusFilter === f.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label} ({counts[f.key] || 0})
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th style={{ width: 100 }}>Priority</th><th style={{ width: 110 }}>Status</th>{isAdmin && <th style={{ width: 80 }}></th>}</tr></thead>
          <tbody>
            {visibleTasks.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3}><div className="empty-state">
                {release.tasks.length === 0 ? 'No tasks assigned to this release yet.' : 'No tasks match this status.'}
              </div></td></tr>
            )}
            {visibleTasks.map((t) => (
              <tr key={t.id} className="clickable" onClick={() => navigate(`/tasks/${t.id}`)}>
                <td style={{ fontWeight: 600 }}>{t.title}</td>
                <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                <td><span className={`badge ${t.status === 'done' ? 'pass' : 'pending'}`}>{t.status.replace('_',' ')}</span></td>
                {isAdmin && (
                  <td>
                    <button className="btn small danger" onClick={(e) => deleteTask(e, t.id, t.title)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewTask && (
        <div className="modal-overlay" onClick={() => !creatingTask && setShowNewTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New task for {release.version}</h2>
            <form onSubmit={createTask}>
              <div className="field">
                <label>Title</label>
                <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required autoFocus disabled={creatingTask} />
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} disabled={creatingTask}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowNewTask(false)} disabled={creatingTask}>Cancel</button>
                <button type="submit" className="btn primary" disabled={creatingTask}>
                  {creatingTask ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
