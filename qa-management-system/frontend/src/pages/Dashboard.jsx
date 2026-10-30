import React, { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Welcome back, {user?.name}.</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {!data && !error && <div className="empty-state">Loading…</div>}

      {data && (
        <>
          <div className="grid cols-3" style={{ marginBottom: 24 }}>
            <div className="stat"><div className="num">{data.totalProjects}</div><div className="lbl">Active Projects</div></div>
            <div className="stat"><div className="num">{data.totalTasks}</div><div className="lbl">Total Tasks</div></div>
            <div className="stat"><div className="num">{data.testSummary.pass + data.testSummary.fail + data.testSummary.pending}</div><div className="lbl">Total Test Cases</div></div>
          </div>

          <div className="section-label">Test execution</div>
          <div className="grid cols-3" style={{ marginBottom: 24 }}>
            <div className="stat pass"><div className="num">{data.testSummary.pass}</div><div className="lbl">Passed</div></div>
            <div className="stat fail"><div className="num">{data.testSummary.fail}</div><div className="lbl">Failed</div></div>
            <div className="stat pending"><div className="num">{data.testSummary.pending}</div><div className="lbl">Pending</div></div>
          </div>

          <div className="section-label">Release status</div>
          <div className="card" style={{ marginBottom: 24 }}>
            {data.releaseStatus.length === 0 ? (
              <div className="empty-state">No releases yet.</div>
            ) : (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {data.releaseStatus.map((r) => (
                  <div key={r.status}>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                    <span style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: 13 }}>{r.c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-label">Recent activity</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>When</th><th>Scenario</th><th>Status</th><th>By</th></tr>
              </thead>
              <tbody>
                {data.recentActivity.length === 0 && (
                  <tr><td colSpan={4}><div className="empty-state">No test executions recorded yet.</div></td></tr>
                )}
                {data.recentActivity.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)' }}>{a.executed_at}</td>
                    <td>{a.scenario}</td>
                    <td><span className={`badge ${a.status}`}>{a.status.replace('_',' ')}</span></td>
                    <td>{a.executed_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
