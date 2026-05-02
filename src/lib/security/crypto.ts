import crypto from 'crypto';

export function timingSafeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function verifySharedSecret(headerValue: string | null, expected: string | undefined): boolean {
  if (!expected) return process.env.NODE_ENV !== 'production';
  return timingSafeCompare(headerValue, expected);
}
