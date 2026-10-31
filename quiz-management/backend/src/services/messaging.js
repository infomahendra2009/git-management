import nodemailer from 'nodemailer';
import { config } from '../config.js';

export function renderMessage(tpl, vars) {
  return String(tpl).replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}

// +919876543210 stays as is. A 10-digit number gets the default country code.
export function toE164(phone, cc = '91') {
  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+${cc}${digits}`;
  return `+${digits}`;
}

const jsonEscape = (s) => JSON.stringify(String(s)).slice(1, -1);

async function ensureOk(res, what) {
  if (res.ok) return;
  const body = await res.text().catch(() => '');
  throw new Error(`${what} failed with HTTP ${res.status}: ${body.slice(0, 200)}`);
}

// cfg and deps can be replaced in tests.
export function createMessenger(cfg = config, deps = {}) {
  const fetchFn = deps.fetch || globalThis.fetch;
  let transporter = deps.transporter || null;
  const getTransporter = () => {
    if (transporter) return transporter;
    if (!cfg.smtp.host) throw new Error('SMTP is not configured (SMTP_HOST)');
    transporter = nodemailer.createTransport({
      host: cfg.smtp.host, port: cfg.smtp.port, secure: cfg.smtp.secure,
      auth: cfg.smtp.user ? { user: cfg.smtp.user, pass: cfg.smtp.pass } : undefined,
    });
    return transporter;
  };

  async function sendEmail(to, subject, text) {
    if (cfg.otp.emailProvider === 'console') { console.log(`[EMAIL] to ${to}: ${subject} | ${text}`); return; }
    if (cfg.otp.emailProvider === 'smtp') {
      await getTransporter().sendMail({ from: cfg.smtp.from, to, subject, text });
      return;
    }
    throw new Error(`Unknown email provider "${cfg.otp.emailProvider}"`);
  }

  async function sendAccountEmail(to, subject, text) {
    if (!cfg.smtp.host || !cfg.smtp.from) throw new Error('Account email is not configured (SMTP_HOST / SMTP_FROM)');
    await getTransporter().sendMail({ from: cfg.smtp.from, to, subject, text });
  }

  // ctx.code is needed by providers that use a pre-approved template (MSG91).
  async function sendSms(phone, text, ctx = {}) {
    const provider = cfg.otp.smsProvider;
    const e164 = toE164(phone, cfg.sms.defaultCountryCode);
    if (provider === 'console') { console.log(`[SMS] to ${e164}: ${text}`); return; }

    if (provider === 'twilio') {
      const t = cfg.sms.twilio;
      const res = await fetchFn(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(t.sid)}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`${t.sid}:${t.token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: e164, From: t.from, Body: text }).toString(),
      });
      return ensureOk(res, 'Twilio SMS');
    }

    if (provider === 'msg91') {
      const m = cfg.sms.msg91;
      const qs = new URLSearchParams({ template_id: m.templateId, mobile: e164.replace('+', ''), otp: String(ctx.code ?? '') });
      const res = await fetchFn(`https://control.msg91.com/api/v5/otp?${qs}`, {
        method: 'POST', headers: { authkey: m.authKey, 'Content-Type': 'application/json' }, body: '{}',
      });
      return ensureOk(res, 'MSG91 SMS');
    }

    if (provider === 'http') { // any gateway: URL, headers and body come from .env
      const h = cfg.sms.http;
      const vars = { phone: e164, phone_digits: e164.replace('+', ''), message: text, code: ctx.code ?? '' };
      const body = h.body.replace(/\{\{(\w+)\}\}/g, (_, k) => jsonEscape(vars[k] ?? ''));
      const url = h.url.replace(/\{\{(\w+)\}\}/g, (_, k) => encodeURIComponent(vars[k] ?? ''));
      let headers = {};
      try { headers = JSON.parse(h.headers || '{}'); } catch { throw new Error('SMS_HTTP_HEADERS is not valid JSON'); }
      const method = h.method.toUpperCase();
      const res = await fetchFn(url, { method, headers, body: method === 'GET' ? undefined : body });
      return ensureOk(res, 'SMS gateway');
    }
    throw new Error(`Unknown SMS provider "${provider}"`);
  }

  return { sendEmail, sendAccountEmail, sendSms };
}

export const messenger = createMessenger();
