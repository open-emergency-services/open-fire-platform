import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Dependency-light password hashing (node `crypto` scrypt). Stored as `salt:hash`. This backs
 * the built-in username/password login — the fallback for departments that don't run SSO.
 */
export function hashPassword(password: string, salt: string = randomBytes(16).toString('hex')): string {
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 32);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
