import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';

export default function Reports() {
  const [searchParams] = useSearchParams();
  const releaseId = searchParams.get('release_id');
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports').then((res) => setReports(res.data));
  }, []);

  useEffect(() => {
    if (!releaseId) { setReport(null); return; }
    api.get(`/reports/release/${releaseId}`)
      .then((res) => setReport(res.data))
      .catch(() => setError('Could not load that release report.'));
  }, [releaseId]);

  function downloadCSV() {
    window.open(`${api.defaults.baseURL}/reports/release/${releaseId}/csv`, '_blank');
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="sub">Per-release breakdowns of pass/fail across severities.</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {report && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginTop: 0 }}>
            Release {report.release.version} <span className={`badge ${report.release.status}`}>{report.release.status}</span>
          </div>
          <div className="grid cols-5" style={{ marginBottom: 16 }}>
            <div className="stat"><div className="num">{report.summary.total}</div><div className="lbl">Total</div></div>
            <div className="stat pass"><div className="num">{report.summary.pass}</div><div className="lbl">Passed</div></div>
            <div className="stat fail"><div className="num">{report.summary.fail}</div><div className="lbl">Failed</div></div>
            <div className="stat pending"><div className="num">{report.summary.pending}</div><div className="lbl">Pending</div></div>
            <div className="stat"><div className="num">{report.summary.total ? Math.round(((report.summary.pass+report.summary.fail)/report.summary.total)*100) : 0}%</div><div className="lbl">Executed</div></div>
          </div>
          <div className="grid cols-2" style={{ gap: 10, marginBottom: 16 }}>
            {Object.entries(report.summary.bySeverity).map(([sev, s]) => (
              <div key={sev} className="stat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${sev}`}>{sev}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>{s.pass} pass · {s.fail} fail · {s.pending} pending / {s.total}</span>
              </div>
            ))}
          </div>
          <button className="btn" onClick={downloadCSV}>↓ Export CSV</button>
        </div>
      )}

      <div className="section-label">Published reports</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Type</th><th style={{ width: 160 }}>Published</th><th style={{ width: 100 }}>Status</th></tr></thead>
          <tbody>
            {reports.length === 0 && (
              <tr><td colSpan={3}><div className="empty-state">No reports published yet. Publish one from a release page.</div></td></tr>
            )}
            {reports.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{r.type}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-faint)' }}>{r.created_at}</td>
                <td><span className={`badge ${r.published ? 'published' : 'draft'}`}>{r.published ? 'Published' : 'Draft'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
