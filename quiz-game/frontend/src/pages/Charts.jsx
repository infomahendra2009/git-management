export function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <div className="v">{value ?? '—'}</div>
      <div className="l">{label}{sub ? ` · ${sub}` : ''}</div>
    </div>
  );
}

const tone = (p) => (p >= 70 ? 'high' : p < 50 ? 'low' : '');

// items: [{label, value (0-100), right?}]
export function Bars({ items, empty = 'No data yet' }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  return items.map((it) => (
    <div className="hbar" key={it.label} title={it.label}>
      <span className="name">{it.label}</span>
      <span className="track"><span className={`fill ${tone(it.value)}`} style={{ display: 'block', width: `${Math.min(100, it.value)}%` }} /></span>
      <span className="val">{it.right ?? `${it.value}%`}</span>
    </div>
  ));
}

export function Histogram({ buckets }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="histo" role="img" aria-label="Score distribution">
      {buckets.map((b) => (
        <div className="col" key={b.label} title={`${b.label}%: ${b.count}`}>
          <span>{b.count || ''}</span>
          <div style={{ height: `${(b.count / max) * 100}%` }} />
          <span className="muted">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// points: [{label, value 0-100}]
export function Trend({ points }) {
  if (points.length === 0) return <p className="muted">No results yet</p>;
  const W = 600, H = 190, L = 34, R = 12, T = 12, B = 24;
  const x = (i) => (points.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (points.length - 1));
  const y = (v) => T + ((100 - v) * (H - T - B)) / 100;
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Score trend">
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} style={{ stroke: 'var(--border)' }} />
          <text x={L - 6} y={y(g) + 4} textAnchor="end" fontSize="10" style={{ fill: 'var(--muted)' }}>{g}</text>
        </g>
      ))}
      {points.length > 1 && <polyline points={line} fill="none" strokeWidth="2" style={{ stroke: 'var(--brand)' }} />}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r="4" style={{ fill: 'var(--brand)' }}><title>{`${p.label}: ${p.value}%`}</title></circle>
      ))}
    </svg>
  );
}
