import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { messenger } from './messaging.js';
import { renderMessage } from './messaging.js';

const { otp } = config;

function generateCode() {
  const max = 10 ** otp.length;
  return String(crypto.randomInt(0, max)).padStart(otp.length, '0');
}

async function deliver(user, channel, code) {
  const text = renderMessage(otp.message, { code, minutes: otp.expiryMinutes, app: config.appName });
  if (channel === 'email') return messenger.sendEmail(user.email, `${config.appName} login code`, text);
  return messenger.sendSms(user.phone, text, { code });
}

export async function sendOtp(user, channel) {
  const last = await prisma.otpCode.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  if (last && Date.now() - last.createdAt.getTime() < otp.resendCooldownSeconds * 1000) {
    const wait = Math.ceil(otp.resendCooldownSeconds - (Date.now() - last.createdAt.getTime()) / 1000);
    const err = new Error(`Please wait ${wait}s before requesting another code`);
    err.status = 429;
    throw err;
  }
  const code = generateCode();
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      codeHash: await bcrypt.hash(code, 8),
      channel,
      expiresAt: new Date(Date.now() + otp.expiryMinutes * 60_000),
    },
  });
  await deliver(user, channel, code);
}

export async function verifyOtp(user, code) {
  const rec = await prisma.otpCode.findFirst({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!rec || rec.attempts >= otp.maxAttempts) return false;
  const ok = await bcrypt.compare(String(code), rec.codeHash);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: rec.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await prisma.otpCode.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return true;
}
