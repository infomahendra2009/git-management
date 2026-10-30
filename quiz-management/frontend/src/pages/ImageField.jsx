import { useState } from 'react';
import { api } from '../api.js';

// URL box + upload button + preview. Used for question and option images.
export default function ImageField({ label, url, onUrl, alt, onAlt }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      onUrl((await api('/media', { method: 'POST', body: fd })).url);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <label>{label}</label>
      <div className="row">
        <input placeholder="Image URL (https://...) or upload" value={url} onChange={(e) => onUrl(e.target.value)} />
        <label className="small" style={{ margin: 0, flex: '0 0 auto' }}>
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pick} style={{ display: 'none' }} />
          <span className="badge" style={{ cursor: 'pointer', padding: '8px 12px' }}>{busy ? 'Uploading…' : 'Upload'}</span>
        </label>
        {url && <button type="button" className="secondary small" onClick={() => onUrl('')}>Remove</button>}
      </div>
      {onAlt && url && <input style={{ marginTop: 6 }} placeholder="Alt text (describe the image)" value={alt} onChange={(e) => onAlt(e.target.value)} />}
      {url && <img className="thumb" src={url} alt={alt || ''} />}
      {err && <div className="err">{err}</div>}
    </div>
  );
}
