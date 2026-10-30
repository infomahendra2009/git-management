import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [version, setVersion] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskRelease, setTaskRelease] = useState('');
  const [error, setError] = useState('');

  // Guards against duplicate submits (double-click / slow network + repeat click)
  // which was creating the same task or release more than once.
  const [creatingRelease, setCreatingRelease] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  function load() {
    api.get(`/projects/${id}`).then((res) => setProject(res.data));
  }

  useEffect(() => { load(); }, [id]);

  async function createRelease(e) {
    e.preventDefault();
    if (creatingRelease) return; // already in flight — ignore extra clicks/submits
    setError('');
    setCreatingRelease(true);
    try {
      await api.post('/releases', { project_id: id, version });
      setVersion(''); setShowNewRelease(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create release.');
    } finally {
      setCreatingRelease(false);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (creatingTask) return; // already in flight — ignore extra clicks/submits
    setError('');
    setCreatingTask(true);
    try {
      await api.post('/tasks', { project_id: id, release_id: taskRelease || null, title: taskTitle, priority: taskPriority });
      setTaskTitle(''); setTaskRelease(''); setShowNewTask(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create task.');
    } finally {
      setCreatingTask(false);
    }
  }

  async function archiveProject() {
    if (!confirm('Archive this project? It will be hidden from the active project list.')) return;
    await api.put(`/projects/${id}/archive`, { archived: true });
    navigate('/projects');
  }

  async function deleteProject() {
    if (!confirm(`Permanently delete "${project.name}"? This also deletes its releases, tasks, and test cases. This cannot be undone.`)) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  }

  async function deleteRelease(e, releaseId, releaseVersion) {
    e.stopPropagation();
    if (!confirm(`Permanently delete release ${releaseVersion}? Its tasks will remain but become unassigned from a release.`)) return;
    await api.delete(`/releases/${releaseId}`);
    load();
  }

  async function deleteTask(e, taskId, taskTitle) {
    e.stopPropagation();
    if (!confirm(`Permanently delete task "${taskTitle}" and all its test cases?`)) return;
    await api.delete(`/tasks/${taskId}`);
    load();
  }

  if (!project) return <div className="empty-state">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects" style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>← All projects</Link>
          <h1 style={{ marginTop: 6 }}>{project.name}</h1>
          <div className="sub">{project.description || 'No description yet.'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={archiveProject}>Archive project</button>
          {isAdmin && <button className="btn danger" onClick={deleteProject}>Delete project</button>}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="section-label">
        Releases
        <button className="btn small" onClick={() => setShowNewRelease(true)}>+ New release</button>
      </div>
      <div className="table-wrap" style={{ marginBottom: 8 }}>
        <table>
          <thead><tr><th>Version</th><th>Status</th><th style={{ width: 140 }}>Published</th>{isAdmin && <th style={{ width: 80 }}></th>}</tr></thead>
          <tbody>
            {project.releases.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3}><div className="empty-state">No releases yet.</div></td></tr>
            )}
            {project.releases.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => navigate(`/releases/${r.id}`)}>
                <td style={{ fontWeight: 600 }}>{r.version}</td>
                <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)' }}>{r.published_at || '—'}</td>
                {isAdmin && (
                  <td>
                    <button className="btn small danger" onClick={(e) => deleteRelease(e, r.id, r.version)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-label">
        Tasks
        <button className="btn small" onClick={() => setShowNewTask(true)}>+ New task</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th style={{ width: 100 }}>Priority</th><th style={{ width: 110 }}>Status</th>{isAdmin && <th style={{ width: 80 }}></th>}</tr></thead>
          <tbody>
            {project.tasks.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3}><div className="empty-state">No tasks yet.</div></td></tr>
            )}
            {project.tasks.map((t) => (
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

      {showNewRelease && (
        <div className="modal-overlay" onClick={() => !creatingRelease && setShowNewRelease(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New release</h2>
            <form onSubmit={createRelease}>
              <div className="field">
                <label>Version</label>
                <input placeholder="e.g. v1.2.0" value={version} onChange={(e) => setVersion(e.target.value)} required autoFocus disabled={creatingRelease} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowNewRelease(false)} disabled={creatingRelease}>Cancel</button>
                <button type="submit" className="btn primary" disabled={creatingRelease}>
                  {creatingRelease ? 'Creating…' : 'Create release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewTask && (
        <div className="modal-overlay" onClick={() => !creatingTask && setShowNewTask(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New task</h2>
            <form onSubmit={createTask}>
              <div className="field">
                <label>Title</label>
                <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required autoFocus disabled={creatingTask} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Priority</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} disabled={creatingTask}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="field">
                  <label>Release (optional)</label>
                  <select value={taskRelease} onChange={(e) => setTaskRelease(e.target.value)} disabled={creatingTask}>
                    <option value="">— None —</option>
                    {project.releases.map((r) => <option key={r.id} value={r.id}>{r.version}</option>)}
                  </select>
                </div>
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
