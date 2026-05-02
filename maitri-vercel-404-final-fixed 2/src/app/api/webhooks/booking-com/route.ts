import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { timingSafeCompare } from '@/lib/security/crypto';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { parseGenericOtaPayload } from '@/lib/channel-manager/ota-parser';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'booking_com.webhook', 120, 60_000);
  if (limited) return limited;
  const body = await request.text();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('x-maitri-webhook-token');
  const expected = process.env.BOOKING_COM_WEBHOOK_TOKEN;

  if (process.env.NODE_ENV === 'production' && (!expected || !timingSafeCompare(token, expected))) {
    return NextResponse.json({ error: 'Booking.com webhook is not configured' }, { status: 501 });
  }

  let payload: any = null;
  try { payload = JSON.parse(body); } catch {}
  const normalized = payload ? parseGenericOtaPayload('booking_com', payload) : null;

  const supabase = createAdminClient();
  await supabase.from('channel_sync_log').insert({
    sync_type: 'booking_pull',
    status: expected ? 'received_unparsed' : 'staged_not_configured',
    records_processed: 0,
    errors: expected ? { parserReady: Boolean(normalized?.success), parserErrors: normalized && !normalized.success ? normalized.error.flatten() : null, normalized: normalized?.success ? normalized.data : null, sampleBytes: body.length } : { reason: 'BOOKING_COM_WEBHOOK_TOKEN missing or partner parser not connected', sampleBytes: body.length },
  });

  return new Response('<?xml version="1.0"?><response status="received" mode="staged"/>', {
    headers: { 'Content-Type': 'application/xml' },
    status: expected ? 202 : 501,
  });
}
