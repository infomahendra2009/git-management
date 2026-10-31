import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ config, onLogin }) {
  const [mode, setMode] = useState('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const requestPasswordReset = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await api('/auth/forgot-password', { method: 'POST', body: { email: identifier } });
      setMode('reset');
      setMsg(r.message);
    });
  };
  const resetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setErr('New passwords do not match');
    run(async () => {
      await api('/auth/reset-password', { method: 'POST', body: { email: identifier, code: resetCode, newPassword } });
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('password');
      setMsg('Password updated. Sign in with your new password.');
    });
  };

  return (
    <div className="center login-page">
      <div className="login-brand">
        <span className="portal-brand-mark">Q</span>
        <span>Quiz<span className="portal-brand-light">Portal</span></span>
      </div>
      <div className="card login-card">
        <span className="eyebrow">{mode === 'forgot' || mode === 'reset' ? 'ACCOUNT RECOVERY' : 'WELCOME BACK'}</span>
        <h1>{mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Sign in to your portal'}</h1>
        <p className="muted">{mode === 'forgot' || mode === 'reset' ? 'We’ll help you securely get back into your account.' : 'Use your email, phone number or user ID.'}</p>

        {mode === 'password' && (
          <form onSubmit={submitPassword}>
            <label htmlFor="id">Email / Phone / User ID</label>
            <input id="id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus required />
            <label htmlFor="pw">Password</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div style={{ marginTop: 16 }}><button disabled={busy} style={{ width: '100%' }}>Login</button></div>
            {config.passwordResetEnabled && <button type="button" className="linkbtn login-recovery-link" onClick={() => { setMode('forgot'); setErr(''); setMsg(''); }}>Forgot password?</button>}
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

        {mode === 'forgot' && (
          <form onSubmit={requestPasswordReset}>
            <label htmlFor="reset-email">Account email</label>
            <input id="reset-email" type="email" autoComplete="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            <div style={{ marginTop: 16 }}><button disabled={busy} style={{ width: '100%' }}>{busy ? 'Sending…' : 'Email me a reset code'}</button></div>
            <button type="button" className="linkbtn login-recovery-link" onClick={() => { setMode('password'); setErr(''); setMsg(''); }}>Back to sign in</button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={resetPassword}>
            <label htmlFor="reset-code">6-digit email code</label>
            <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
            <label htmlFor="new-password">New password (min 8 characters)</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={100} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <label htmlFor="confirm-new-password">Confirm new password</label>
            <input id="confirm-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={100} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <div style={{ marginTop: 16 }}><button disabled={busy} style={{ width: '100%' }}>{busy ? 'Updating…' : 'Reset password'}</button></div>
            <button type="button" className="linkbtn login-recovery-link" onClick={() => { setMode('forgot'); setResetCode(''); setErr(''); setMsg(''); }}>Request another code</button>
          </form>
        )}

        {msg && <div className="ok">{msg}</div>}
        {err && <div className="err">{err}</div>}

        {config.otpEnabled && (mode === 'password' || mode === 'otp') && (
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
