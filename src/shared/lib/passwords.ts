/**
 * Security-focused password hashing utilities.
 */
import { scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export const hashPassword = (password: string, salt: string): string => {
  const derived = scryptSync(password, salt, KEY_LENGTH);
  return derived.toString('hex');
};

export const verifyPassword = (password: string, salt: string, hash: string): boolean => {
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, 'hex');

  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(derived, stored);
};
