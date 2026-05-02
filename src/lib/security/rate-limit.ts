import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const DEFAULT_WINDOW_MS = 60_000;

export type RateLimitOptions = {
  key: string;
  limit?: number;
  windowMs?: number;
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit({ key, limit = 60, windowMs = DEFAULT_WINDOW_MS }: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  existing.count += 1;
  if (existing.count > limit) return { ok: false, remaining: 0, resetAt: existing.resetAt };
  return { ok: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export function enforceRateLimit(request: Request, scope: string, limit = 60, windowMs = DEFAULT_WINDOW_MS) {
  const key = `${scope}:${getClientIp(request)}`;
  const result = checkRateLimit({ key, limit, windowMs });
  if (!result.ok) return rateLimitResponse(result.resetAt);
  return null;
}
