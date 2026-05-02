import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { timingSafeCompare } from '@/lib/security/crypto';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { parseGenericOtaPayload } from '@/lib/channel-manager/ota-parser';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'agoda.webhook', 120, 60_000);
  if (limited) return limited;
  const rawBody = await request.text();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('x-maitri-webhook-token');
  const expected = process.env.AGODA_WEBHOOK_TOKEN;

  if (process.env.NODE_ENV === 'production' && (!expected || !timingSafeCompare(token, expected))) {
    return NextResponse.json({ error: 'Agoda webhook is not configured' }, { status: 501 });
  }

  let payload: any = null;
  try { payload = JSON.parse(rawBody); } catch {}
  const normalized = payload ? parseGenericOtaPayload('agoda', payload) : null;

  const supabase = createAdminClient();
  await supabase.from('channel_sync_log').insert({
    sync_type: 'booking_pull',
    status: expected ? 'received_unparsed' : 'staged_not_configured',
    records_processed: 0,
    errors: expected ? { parserReady: Boolean(normalized?.success), parserErrors: normalized && !normalized.success ? normalized.error.flatten() : null, normalized: normalized?.success ? normalized.data : null } : { reason: 'AGODA_WEBHOOK_TOKEN missing or YCS parser not connected', payloadPreview: payload ? Object.keys(payload) : [] },
  });

  return NextResponse.json({ status: expected ? 'received' : 'not_configured', mode: 'staged' }, { status: expected ? 202 : 501 });
}
