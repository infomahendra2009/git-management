import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { identifierWhere, normalizeEmail, publicUser } from '../utils.js';
import { sendOtp, verifyOtp } from '../services/otp.js';
import { audit } from '../services/audit.js';
import { isLocked, nextFailureState, minutesLeft } from '../services/lockout.js';
import { messenger } from '../services/messaging.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const resetRequestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const resetSubmitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const GENERIC = { error: 'Invalid credentials' };
const RESET_MESSAGE = { message: 'If an active account uses that email, a password reset code has been sent.' };

const findUser = (identifier) => prisma.user.findUnique({ where: identifierWhere(identifier) });

async function finishLogin(req, res, user, method) {
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLogins: 0, lockedUntil: null } });
  audit(user.id, 'LOGIN', { meta: { method }, ip: req.ip });
  res.json({ token: signToken(user), user: publicUser(user) });
}

// Public runtime config (read by the frontend on load; no rebuild needed)
router.get('/config', (_req, res) => res.json({
  otpEnabled: config.otp.enabled,
  passwordResetEnabled: Boolean(config.smtp.host && config.smtp.from),
}));

router.post('/login', limiter, async (req, res) => {
  const body = z.object({ identifier: z.string().min(1).max(190), password: z.string().min(1).max(200) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Identifier and password required' });
  const user = await findUser(body.data.identifier);

  if (user?.isActive && isLocked(user)) {
    audit(user.id, 'LOGIN_BLOCKED', { ip: req.ip });
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutesLeft(user)} minute(s), or ask an admin to unlock the account.` });
  }
  if (!user || !user.isActive || !(await bcrypt.compare(body.data.password, user.passwordHash))) {
    if (user?.isActive) {
      const st = nextFailureState(user, config.lockout);
      await prisma.user.update({ where: { id: user.id }, data: { failedLogins: st.failedLogins, lockedUntil: st.lockedUntil } });
      if (st.locked) audit(user.id, 'ACCOUNT_LOCKED', { ip: req.ip });
    }
    audit(user?.id, 'LOGIN_FAILED', { meta: { identifier: body.data.identifier.slice(0, 100) }, ip: req.ip });
    return res.status(401).json(GENERIC);
  }
  await finishLogin(req, res, user, 'password');
});

// ---- OTP (alternative to password). 404 when OTP_ENABLED=false ----
const otpGate = (_req, res, next) => (config.otp.enabled ? next() : res.status(404).json({ error: 'Not found' }));

router.post('/otp/request', otpGate, limiter, async (req, res) => {
  const body = z.object({ identifier: z.string().min(1).max(190), channel: z.enum(['sms', 'email']).default('sms') }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid request' });
  const user = await findUser(body.data.identifier);
  // Always respond the same way so accounts can't be enumerated
  if (user && user.isActive && !isLocked(user)) {
    try {
      await sendOtp(user, body.data.channel);
    } catch (e) {
      if (e.status === 429) return res.status(429).json({ error: e.message });
      console.error('OTP send failed:', e.message);
      audit(user.id, 'OTP_SEND_FAILED', { meta: { channel: body.data.channel, reason: e.message.slice(0, 200) } });
    }
  }
  res.json({ message: 'If the account exists, a code has been sent' });
});

router.post('/otp/verify', otpGate, limiter, async (req, res) => {
  const body = z.object({ identifier: z.string().min(1).max(190), code: z.string().min(4).max(10) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid request' });
  const user = await findUser(body.data.identifier);
  if (!user || !user.isActive || isLocked(user) || !(await verifyOtp(user, body.data.code))) {
    audit(user?.id, 'LOGIN_FAILED', { meta: { method: 'otp' }, ip: req.ip });
    return res.status(401).json({ error: 'Invalid or expired code' });
  }
  await finishLogin(req, res, user, 'otp');
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.post('/change-password', requireAuth, async (req, res) => {
  const body = z
    .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(100) })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  if (!(await bcrypt.compare(body.data.currentPassword, req.user.passwordHash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: req.user.id },
      data: {
        passwordHash: await bcrypt.hash(body.data.newPassword, 10),
        mustChangePassword: false,
        failedLogins: 0,
        lockedUntil: null,
      },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: req.user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
  });
  audit(req.user.id, 'PASSWORD_CHANGED', { ip: req.ip });
  res.json({ ok: true });
});

router.post('/forgot-password', resetRequestLimiter, async (req, res) => {
  if (!config.smtp.host || !config.smtp.from) {
    return res.status(503).json({ error: 'Email password reset is not configured. Contact your administrator.' });
  }
  const body = z.object({ email: z.string().email().max(190).transform(normalizeEmail) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Enter a valid email address' });
  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (user?.isActive) {
    await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const token = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(code, 10),
        expiresAt: new Date(Date.now() + config.passwordReset.expiryMinutes * 60_000),
      },
    });
    try {
      await messenger.sendAccountEmail(
        user.email,
        `${config.appName} password reset code`,
        `Your password reset code is ${code}. It expires in ${config.passwordReset.expiryMinutes} minutes. If you did not request this, you can ignore this email.`,
      );
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, id: { not: token.id }, usedAt: null },
        data: { usedAt: new Date() },
      });
    } catch (error) {
      await prisma.passwordResetToken.delete({ where: { id: token.id } });
      console.error('Password reset email delivery failed:', error.message);
    }
  }
  res.status(202).json(RESET_MESSAGE);
});

router.post('/reset-password', resetSubmitLimiter, async (req, res) => {
  const body = z.object({
    email: z.string().email().max(190).transform(normalizeEmail),
    code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    newPassword: z.string().min(8).max(100),
  }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.issues[0]?.message || 'Invalid request' });

  const now = new Date();
  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  const token = user?.isActive
    ? await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: now }, attempts: { lt: config.passwordReset.maxAttempts } },
      orderBy: { createdAt: 'desc' },
    })
    : null;
  if (!user || !token || !(await bcrypt.compare(body.data.code, token.tokenHash))) {
    if (token) await prisma.passwordResetToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } });
    audit(user?.id, 'PASSWORD_RESET_FAILED', { ip: req.ip });
    return res.status(400).json({ error: 'Invalid or expired reset code' });
  }

  const passwordHash = await bcrypt.hash(body.data.newPassword, 10);
  const updated = await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: token.id, usedAt: null, expiresAt: { gt: now }, attempts: { lt: config.passwordReset.maxAttempts } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) return false;
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false, failedLogins: 0, lockedUntil: null },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: user.id, id: { not: token.id }, usedAt: null },
      data: { usedAt: now },
    });
    return true;
  });
  if (!updated) return res.status(400).json({ error: 'Invalid or expired reset code' });
  audit(user.id, 'PASSWORD_RESET', { targetType: 'User', targetId: user.id, ip: req.ip });
  res.json({ ok: true });
});

export default router;
