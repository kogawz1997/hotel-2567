import { NextResponse } from 'next/server';
import { isMockServicesEnabled } from '@/lib/env';

function normalizeHost(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

export function enforceSameOrigin(request: Request) {
  if (process.env.NODE_ENV !== 'production' || isMockServicesEnabled()) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return NextResponse.json({ error: 'Application URL is not configured' }, { status: 500 });

  const expectedHost = normalizeHost(appUrl);
  const originHost = normalizeHost(request.headers.get('origin'));
  const refererHost = normalizeHost(request.headers.get('referer'));

  // Server-to-server and mobile clients may omit Origin. Browser-originated writes should match the app host.
  if (originHost && originHost !== expectedHost) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }
  if (!originHost && refererHost && refererHost !== expectedHost) {
    return NextResponse.json({ error: 'Invalid request referer' }, { status: 403 });
  }
  return null;
}
