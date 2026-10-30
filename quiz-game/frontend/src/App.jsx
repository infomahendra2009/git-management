import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({ otpEnabled: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try { setConfig(await api('/auth/config')); } catch {}
      if (getToken()) {
        try { setUser((await api('/auth/me')).user); } catch { setToken(null); }
      }
      setReady(true);
    })();
  }, []);

  const onLogin = ({ token, user }) => { setToken(token); setUser(user); };
  const logout = () => { setToken(null); setUser(null); };

  if (!ready) return <div className="center muted">Loading…</div>;
  if (!user) return <Login config={config} onLogin={onLogin} />;
  if (user.mustChangePassword) {
    return <ChangePassword onDone={() => setUser({ ...user, mustChangePassword: false })} onLogout={logout} />;
  }
  return <Dashboard user={user} onLogout={logout} />;
}
