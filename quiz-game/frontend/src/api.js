const KEY = 'quiz_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

const authHeader = () => (getToken() ? { Authorization: `Bearer ${getToken()}` } : {});

export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method,
    headers: { ...(isForm || !body ? {} : { 'Content-Type': 'application/json' }), ...authHeader() },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.details = data.errors;
    throw err;
  }
  return data;
}

// Download a file that needs the auth header (CSV templates / export)
export async function download(path, filename) {
  const res = await fetch(`/api${path}`, { headers: authHeader() });
  if (!res.ok) throw new Error('Download failed');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
