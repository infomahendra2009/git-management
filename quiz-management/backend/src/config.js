import 'dotenv/config';

const bool = (v, d = false) => (v === undefined || v === '' ? d : String(v).toLowerCase() === 'true');
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
const WEAK_SECRETS = ['dev-secret-change-me', 'change_me_to_a_long_random_string'];

const legacyProvider = process.env.OTP_PROVIDER || 'console';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 4000),
  appName: process.env.APP_NAME || 'Quiz Platform',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  // Leave empty when the web app and API share one domain (the Docker setup does).
  corsOrigin: process.env.CORS_ORIGIN || '',
  apiRatePerMinute: num(process.env.API_RATE_LIMIT_PER_MIN, 3000),
  lockout: { maxFailures: num(process.env.LOGIN_MAX_FAILURES, 5), minutes: num(process.env.LOGIN_LOCK_MINUTES, 15) },
  otp: {
    enabled: bool(process.env.OTP_ENABLED, false),
    smsProvider: process.env.OTP_SMS_PROVIDER || legacyProvider,     // console | twilio | msg91 | http
    emailProvider: process.env.OTP_EMAIL_PROVIDER || legacyProvider, // console | smtp
    length: num(process.env.OTP_LENGTH, 6),
    expiryMinutes: num(process.env.OTP_EXPIRY_MINUTES, 5),
    maxAttempts: num(process.env.OTP_MAX_ATTEMPTS, 5),
    resendCooldownSeconds: num(process.env.OTP_RESEND_COOLDOWN_SECONDS, 60),
    message: process.env.OTP_MESSAGE || 'Your {{app}} login code is {{code}}. It is valid for {{minutes}} minutes. Do not share it.',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
  sms: {
    defaultCountryCode: process.env.SMS_DEFAULT_COUNTRY_CODE || '91',
    twilio: { sid: process.env.TWILIO_ACCOUNT_SID || '', token: process.env.TWILIO_AUTH_TOKEN || '', from: process.env.TWILIO_FROM || '' },
    msg91: { authKey: process.env.MSG91_AUTH_KEY || '', templateId: process.env.MSG91_TEMPLATE_ID || '' },
    http: { url: process.env.SMS_HTTP_URL || '', method: process.env.SMS_HTTP_METHOD || 'POST', headers: process.env.SMS_HTTP_HEADERS || '{}', body: process.env.SMS_HTTP_BODY || '' },
  },
};

// Refuse to run in production with a guessable secret.
export function assertSafeConfig(c = config) {
  if (c.env === 'production' && (WEAK_SECRETS.includes(c.jwtSecret) || c.jwtSecret.length < 24)) {
    throw new Error('JWT_SECRET must be a random string of at least 24 characters (see .env.example). Refusing to start.');
  }
  const problems = [];
  if (c.otp.enabled) {
    if (c.otp.emailProvider === 'smtp' && (!c.smtp.host || !c.smtp.from)) problems.push('OTP email provider is "smtp" but SMTP_HOST / SMTP_FROM are not set');
    if (c.otp.smsProvider === 'twilio' && !(c.sms.twilio.sid && c.sms.twilio.token && c.sms.twilio.from)) problems.push('OTP SMS provider is "twilio" but TWILIO_* settings are missing');
    if (c.otp.smsProvider === 'msg91' && !(c.sms.msg91.authKey && c.sms.msg91.templateId)) problems.push('OTP SMS provider is "msg91" but MSG91_* settings are missing');
    if (c.otp.smsProvider === 'http' && !c.sms.http.url) problems.push('OTP SMS provider is "http" but SMS_HTTP_URL is not set');
    if (c.env === 'production' && (c.otp.smsProvider === 'console' || c.otp.emailProvider === 'console')) problems.push('OTP provider "console" only prints codes in the log. Use a real provider in production');
  }
  problems.forEach((p) => console.warn(`CONFIG WARNING: ${p}`));
  return problems;
}
