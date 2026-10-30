import { useEffect, useState } from 'react';
import { api, download } from '../api.js';

const TEMPLATES = [
  ['multiple_choice', 'Multiple choice'], ['multiple_select', 'Multiple select'], ['true_false', 'True/False'],
  ['text_input', 'Text input'], ['essay', 'Essay'], ['mixed', 'Mixed (all types)'],
];

export default function ImportCsv({ onImported }) {
  const [csv, setCsv] = useState(null);
  const [zip, setZip] = useState(null);
  const [mode, setMode] = useState('create');
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);

  const loadLogs = () => api('/questions/imports').then((r) => setLogs(r.logs)).catch(() => {});
  useEffect(() => { loadLogs(); }, []);

  const send = async (commit) => {
    setErr(''); setBusy(true); setDone(null);
    const fd = new FormData();
    fd.append('csv', csv);
    if (zip) fd.append('images', zip);
    fd.append('mode', mode);
    fd.append('commit', String(commit));
    try {
      const r = await api('/questions/import', { method: 'POST', body: fd });
      if (commit) { setDone(r); setResult(null); onImported?.(); loadLogs(); } else setResult(r);
    } catch (e) {
      setErr(e.message);
      if (e.details) setResult({ errors: e.details, errorCount: e.details.length, summary: null, preview: [], warnings: [], canImport: false });
    } finally { setBusy(false); }
  };

  const dl = (path, name) => download(path, name).catch((e) => setErr(e.message));

  return (
    <>
      <div className="card">
        <h3>1. Get a template</h3>
        <div className="row">
          {TEMPLATES.map(([k, label]) => (
            <button key={k} className="secondary small" onClick={() => dl(`/questions/template/${k}`, `template_${k}.csv`)}>{label}</button>
          ))}
          <button className="secondary small" onClick={() => dl('/questions/export', 'questions_export.csv')}>Export my questions</button>
        </div>
        <p className="muted">Images: use full https:// URLs, or put file names in the CSV and upload a ZIP with those files below. Max 5 MB per image (JPG, PNG, GIF, WebP).</p>
      </div>

      <div className="card">
        <h3>2. Upload and check</h3>
        <label>CSV file</label>
        <input type="file" accept=".csv,text/csv" onChange={(e) => { setCsv(e.target.files[0] || null); setResult(null); setDone(null); }} />
        <label>Images ZIP (optional)</label>
        <input type="file" accept=".zip,application/zip" onChange={(e) => { setZip(e.target.files[0] || null); setResult(null); }} />
        <label>If a question_id already exists</label>
        <select value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }}>
          <option value="create">Report an error (add new questions only)</option>
          <option value="upsert">Update the existing question</option>
        </select>
        <div style={{ marginTop: 14 }}><button disabled={!csv || busy} onClick={() => send(false)}>{busy ? 'Checking…' : 'Check file (preview)'}</button></div>
        {err && !result && <div className="err">{err}</div>}
      </div>

      {done && (
        <div className="card ok">Import complete: {done.created} added, {done.updated} updated (of {done.total} rows).</div>
      )}

      {result && (
        <div className="card">
          <h3>3. Review</h3>
          {result.summary && (
            <p>{result.summary.total} rows · <strong>{result.summary.valid} valid</strong> · {result.summary.invalid} with errors
              {' '}· {result.summary.toCreate} to add · {result.summary.toUpdate} to update</p>
          )}
          {result.errorCount > 0 && (
            <>
              <div className="err">Fix these and upload again. Nothing is imported until the file has no errors.</div>
              <ul className="errlist">{result.errors.map((e, i) => <li key={i}>{e.line ? `Row ${e.line}: ` : ''}{e.message}</li>)}</ul>
              {result.errorCount > result.errors.length && <p className="muted">…and {result.errorCount - result.errors.length} more.</p>}
            </>
          )}
          {result.warnings?.length > 0 && <ul className="errlist muted">{result.warnings.map((w, i) => <li key={i}>Warning: {w}</li>)}</ul>}
          {result.preview?.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Row</th><th>ID</th><th>Type</th><th>Question</th><th></th></tr></thead>
                <tbody>
                  {result.preview.map((p) => (
                    <tr key={p.line}><td>{p.line}</td><td>{p.id}</td><td>{p.type}</td><td>{p.text}</td>
                      <td><span className={`badge ${p.ok ? '' : 'off'}`}>{p.ok ? 'OK' : 'Error'}</span></td></tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">Showing the first 5 rows.</p>
            </div>
          )}
          {result.canImport && (
            <button disabled={busy} onClick={() => send(true)}>Import {result.summary.valid} questions</button>
          )}
        </div>
      )}

      <div className="card">
        <h3>Import history</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>When</th><th>File</th><th>Status</th><th>Added</th><th>Updated</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.filename}</td>
                  <td><span className={`badge ${l.status === 'FAILED' ? 'off' : ''}`}>{l.status}</span></td><td>{l.created}</td><td>{l.updated}</td></tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="muted">No imports yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
