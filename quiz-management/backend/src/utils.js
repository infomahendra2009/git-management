import crypto from 'crypto';

export const normalizeEmail = (v) => String(v).trim().toLowerCase();

export function normalizePhone(v) {
  const cleaned = String(v).replace(/[\s\-()]/g, '');
  return cleaned;
}

export const PHONE_RE = /^\+?[0-9]{10,15}$/;

// Decide whether the login identifier is an email, phone or user code.
export function identifierWhere(identifier) {
  const id = String(identifier).trim();
  if (id.includes('@')) return { email: id.toLowerCase() };
  const phone = normalizePhone(id);
  if (PHONE_RE.test(phone)) return { phone };
  return { userCode: id };
}

export function randomPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
  return Array.from(crypto.randomBytes(len), (b) => chars[b % chars.length]).join('');
}

export function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}
