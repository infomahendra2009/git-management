export const isLocked = (user, now = new Date()) => !!user.lockedUntil && new Date(user.lockedUntil) > now;

// Returns the new counters after one more wrong password.
export function nextFailureState(user, cfg, now = new Date()) {
  const expired = user.lockedUntil && new Date(user.lockedUntil) <= now;
  const failed = (expired ? 0 : user.failedLogins || 0) + 1;
  if (failed >= cfg.maxFailures) {
    return { failedLogins: 0, lockedUntil: new Date(now.getTime() + cfg.minutes * 60000), locked: true };
  }
  return { failedLogins: failed, lockedUntil: null, locked: false };
}

export const minutesLeft = (user, now = new Date()) => Math.max(1, Math.ceil((new Date(user.lockedUntil) - now) / 60000));
