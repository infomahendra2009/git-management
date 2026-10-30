import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function PublicDashboard() {
  const [latest, setLatest] = useState(undefined);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/public/latest').then((res) => setLatest(res.data)).catch(() => setLatest(null));
    api.get('/public/history').then((res) => setHistory(res.data)).catch(() => setHistory([]));
  }, []);

  const s = latest?.summary;
  const executedPct = s && s.total ? Math.round(((s.pass + s.fail) / s.total) * 100) : 0;

  let stampLine1 = 'Awaiting', stampLine2 = 'Sign-off', ringClass = '', textClass = '', statusLine =
    'No release has been published yet. Once QA publishes a report, it will appear here automatically.';

  if (s) {
    const criticalFails = s.bySeverity?.critical?.fail || 0;
    const highFails = s.bySeverity?.high?.fail || 0;
    if (criticalFails > 0) {
      ringClass = 'blocked'; textClass = 'blocked'; stampLine1 = 'Release'; stampLine2 = 'Blocked';
      statusLine = `${criticalFails} critical failure(s) recorded. Release is blocked until resolved and re-tested.`;
    } else if (highFails > 0) {
      ringClass = 'blocked'; textClass = 'blocked'; stampLine1 = 'Needs'; stampLine2 = 'Approval';
      statusLine = `${highFails} high-severity failure(s) recorded. Release can proceed only with business approval.`;
    } else if (executedPct === 100) {
      ringClass = 'cleared'; textClass = 'cleared'; stampLine1 = 'Cleared'; stampLine2 = 'for Release';
      statusLine = 'All test cases passed — cleared for production release.';
    } else {
      statusLine = `${s.pass} of ${s.total} cases passed so far. Execution is ${executedPct}% complete.`;
    }
  }

  return (
    <div className="public-page">
      <style>{`
        .public-page{ max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }
        .public-page .eyebrow{ font-family: var(--mono); font-size: 11px; letter-spacing:.12em; text-transform:uppercase; color: var(--brand); font-weight:700; margin-bottom:14px; }
        .public-page h1{ font-size: 34px; margin-bottom: 10px; }
        .public-page .lede{ color: var(--ink-dim); font-size: 14.5px; max-width: 560px; line-height:1.6; margin-bottom: 30px; }
        .report-card{ background: var(--panel); border:1px solid var(--rule); border-radius:14px; padding: 32px; display:grid; grid-template-columns: 170px 1fr; gap: 30px; align-items:center; margin-bottom: 30px; }
        .stamp{ width: 150px; height: 150px; transform: rotate(-9deg); }
        .stamp-ring{ fill:none; stroke: var(--pending); stroke-width: 2; stroke-dasharray: 3 4; }
        .stamp-ring.cleared{ stroke: var(--brand); }
        .stamp-ring.blocked{ stroke: var(--critical); }
        .stamp-text{ font-family: var(--mono); font-size: 9.5px; letter-spacing: .1em; fill: var(--pending); font-weight:700; }
        .stamp-text.cleared{ fill: var(--brand); }
        .stamp-text.blocked{ fill: var(--critical); }
        .stamp-center{ font-family: var(--serif); font-size: 14px; fill: var(--ink); }
        .stamp-sub{ font-family: var(--mono); font-size: 7.5px; fill: var(--ink-faint); letter-spacing:.06em; }
        .history-row{ display:flex; align-items:center; gap:14px; font-size:12.5px; padding: 8px 0; }
        .history-label{ width:170px; flex-shrink:0; color: var(--ink-dim); font-family: var(--mono); font-size:11.5px; }
        .history-bar-track{ flex:1; height:7px; background: var(--panel-2); border-radius:99px; overflow:hidden; border:1px solid var(--rule); }
        .history-bar-fill{ height:100%; background: var(--brand); }
        .history-pct{ width:42px; text-align:right; font-family: var(--mono); font-size:11.5px; color: var(--ink-dim); }
        @media (max-width: 640px){ .report-card{ grid-template-columns: 1fr; text-align:center; } }
      `}</style>

      <div className="eyebrow">Public dashboard · read only</div>
      <h1>Release Readiness Report</h1>
      <p className="lede">The latest published QA report for this product — no login required.</p>

      {latest === undefined && <div className="empty-state">Loading…</div>}

      {latest === null && (
        <div className="report-card" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No report published yet</h2>
            <div style={{ color: 'var(--ink-dim)', fontSize: 13.5 }}>{statusLine}</div>
          </div>
        </div>
      )}

      {latest && s && (
        <div className="report-card">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg className="stamp" viewBox="0 0 200 200">
              <circle className={`stamp-ring ${ringClass}`} cx="100" cy="100" r="86" />
              <circle className={`stamp-ring ${ringClass}`} cx="100" cy="100" r="74" />
              <text className="stamp-center" x="100" y="96" textAnchor="middle">{stampLine1}</text>
              <text className="stamp-center" x="100" y="118" textAnchor="middle">{stampLine2}</text>
              <text className="stamp-sub" x="100" y="136" textAnchor="middle">{latest.project_name?.toUpperCase()}</text>
              <path id="pubArc" d="M 30 100 A 70 70 0 0 1 170 100" fill="none" />
              <text className={`stamp-text ${textClass}`}>
                <textPath href="#pubArc" startOffset="50%" textAnchor="middle">QA MANAGEMENT SYSTEM</textPath>
              </text>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: 21, marginBottom: 6 }}>{latest.project_name} — {latest.version}</h2>
            <div style={{ color: 'var(--ink-dim)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>{statusLine}</div>
            <div className="grid cols-5">
              <div className="stat"><div className="num">{s.total}</div><div className="lbl">Total</div></div>
              <div className="stat pass"><div className="num">{s.pass}</div><div className="lbl">Passed</div></div>
              <div className="stat fail"><div className="num">{s.fail}</div><div className="lbl">Failed</div></div>
              <div className="stat pending"><div className="num">{s.pending}</div><div className="lbl">Pending</div></div>
              <div className="stat"><div className="num">{executedPct}%</div><div className="lbl">Executed</div></div>
            </div>
          </div>
        </div>
      )}

      <div className="section-label">Release history</div>
      {history.length === 0 ? (
        <div className="empty-state" style={{ border: '1px dashed var(--rule)', borderRadius: 10 }}>
          No previous releases have been published yet.
        </div>
      ) : (
        <div>
          {history.map((h) => (
            <div className="history-row" key={h.id}>
              <span className="history-label">{h.project_name} · {h.version}</span>
              <div className="history-bar-track"><div className="history-bar-fill" style={{ width: `${h.passRate}%` }} /></div>
              <span className="history-pct">{h.passRate}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
