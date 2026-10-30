import { createApp } from './app.js';
import { config, assertSafeConfig } from './config.js';
import { prisma } from './db.js';
import { expireOverdue } from './services/attempts.js';

assertSafeConfig();

const server = createApp().listen(config.port, () => {
  console.log(`API listening on :${config.port} (${config.env}, OTP ${config.otp.enabled ? 'ON' : 'OFF'})`);
});

const timers = [
  // Server-side timer: auto-submit attempts whose deadline has passed (even if the student closed the browser).
  setInterval(() => expireOverdue(prisma).catch((e) => console.error('expire sweep failed', e)), 30_000),
  // Housekeeping: drop one-time codes older than a day.
  setInterval(() => prisma.otpCode.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } }).catch((e) => console.error('otp cleanup failed', e)), 3_600_000),
];

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  timers.forEach(clearInterval);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
