import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Guards against duplicate submits (double-click / slow network + repeat click).
  const [creating, setCreating] = useState(false);

  function load() {
    api.get('/projects', { params: search ? { search } : {} }).then((res) => setProjects(res.data));
  }

  useEffect(() => { load(); }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    if (creating) return;
    setError('');
    setCreating(true);
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); setShowNew(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create project.');
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(e, projectId, projectName) {
    e.stopPropagation();
    if (!confirm(`Permanently delete "${projectName}"? This also deletes its releases, tasks, and test cases. This cannot be undone.`)) return;
    await api.delete(`/projects/${projectId}`);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <div className="sub">Everything QA is tracking, grouped by product area.</div>
        </div>
        <button className="btn primary" onClick={() => setShowNew(true)}>+ New project</button>
      </div>

      <div className="toolbar">
        <input className="search-box" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Description</th><th style={{ width: 140 }}>Created</th>{isAdmin && <th style={{ width: 80 }}></th>}</tr></thead>
          <tbody>
            {projects.length === 0 && (
              <tr><td colSpan={isAdmin ? 4 : 3}><div className="empty-state">No projects yet — create one to get started.</div></td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: 'var(--ink-dim)' }}>{p.description || '—'}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)' }}>{p.created_at}</td>
                {isAdmin && (
                  <td>
                    <button className="btn small danger" onClick={(e) => deleteProject(e, p.id, p.name)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => !creating && setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New project</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus disabled={creating} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={creating} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowNew(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="btn primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
