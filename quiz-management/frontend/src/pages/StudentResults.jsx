import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { StudentBody } from './Reports.jsx';

export default function StudentResults() {
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/student/results').then(setR).catch((e) => setErr(e.message)); }, []);
  if (!r) return <div className="card muted">{err || 'Loading…'}</div>;
  return (
    <>
      {r.awaitingRelease > 0 && <div className="card muted">{r.awaitingRelease} submitted attempt(s) are waiting for your teacher to release the results.</div>}
      {r.summary.attempts === 0
        ? <div className="card muted">No released results yet. They will appear here after your teacher releases them.</div>
        : <StudentBody r={r} />}
    </>
  );
}
