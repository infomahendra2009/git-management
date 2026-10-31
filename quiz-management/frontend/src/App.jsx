import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import PwaInstallButton from './pages/PwaInstallButton.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({ otpEnabled: false, passwordResetEnabled: false });
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

  let content;
  if (!ready) content = <div className="center muted">Loading…</div>;
  else if (!user) content = <Login config={config} onLogin={onLogin} />;
  else if (user.mustChangePassword) {
    content = <ChangePassword forced onDone={() => setUser({ ...user, mustChangePassword: false })} onLogout={logout} />;
  } else content = <Dashboard user={user} onLogout={logout} />;

  return <>{content}<PwaInstallButton /></>;
}
