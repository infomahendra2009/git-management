import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ config, onLogin }) {
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState('sms');
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setErr(''); setMsg(''); setBusy(true);
    try { await fn(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const submitPassword = (e) => {
    e.preventDefault();
    run(async () => onLogin(await api('/auth/login', { method: 'POST', body: { identifier, password } })));
  };
  const sendOtp = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await api('/auth/otp/request', { method: 'POST', body: { identifier, channel } });
      setOtpSent(true); setMsg(r.message);
    });
  };
  const verifyOtp = (e) => {
    e.preventDefault();
    run(async () => onLogin(await api('/auth/otp/verify', { method: 'POST', body: { identifier, code } })));
  };

  return (
    <div className="center login-page">
      <div className="login-brand">
        <span className="portal-brand-mark">Q</span>
        <span>Quiz<span className="portal-brand-light">Portal</span></span>
      </div>
      <div className="card login-card">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to your portal</h1>
        <p className="muted">Use your email, phone number or user ID.</p>

        {mode === 'password' && (
          <form onSubmit={submitPassword}>
            <label htmlFor="id">Email / Phone / User ID</label>
            <input id="id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus required />
            <label htmlFor="pw">Password</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div style={{ marginTop: 16 }}><button disabled={busy} style={{ width: '100%' }}>Login</button></div>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={otpSent ? verifyOtp : sendOtp}>
            <label htmlFor="oid">Email / Phone / User ID</label>
            <input id="oid" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required disabled={otpSent} />
            {!otpSent && (
              <>
                <label htmlFor="ch">Send code by</label>
                <select id="ch" value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </>
            )}
            {otpSent && (
              <>
                <label htmlFor="code">One-time code</label>
                <input id="code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} autoFocus required />
              </>
            )}
            <div style={{ marginTop: 16 }}>
              <button disabled={busy} style={{ width: '100%' }}>{otpSent ? 'Verify & login' : 'Send code'}</button>
            </div>
            {otpSent && (
              <p className="muted"><a href="#" onClick={(e) => { e.preventDefault(); setOtpSent(false); setCode(''); }}>Resend / change</a></p>
            )}
          </form>
        )}

        {msg && <div className="ok">{msg}</div>}
        {err && <div className="err">{err}</div>}

        {config.otpEnabled && (
          <p style={{ marginTop: 16 }}>
            <button className="secondary" style={{ width: '100%' }}
              onClick={() => { setMode(mode === 'password' ? 'otp' : 'password'); setErr(''); setMsg(''); setOtpSent(false); }}>
              {mode === 'password' ? 'Login with OTP' : 'Login with password'}
            </button>
          </p>
        )}
        <p className="muted">No account? Ask your institution admin to create one.</p>
      </div>
    </div>
  );
}
