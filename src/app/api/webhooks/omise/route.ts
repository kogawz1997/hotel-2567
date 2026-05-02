import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonResponse } from '@/lib/http/response';
import { getRequestId, logError, logEvent } from '@/lib/observability/logger';

const SUPPORTED_EVENTS = ['charge.complete', 'charge.expired', 'refund.create'];

function timingSafeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyOmiseWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.OMISE_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (!signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const normalized = signature.replace(/^sha256=/, '');
  return timingSafeCompare(normalized, expected);
}

async function recordWebhookEvent(supabase: any, event: any, status: 'received' | 'processed' | 'ignored' | 'failed', error?: string) {
  const eventId = event.id || `${event.key}:${event.data?.id || crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')}`;
  const { data } = await supabase
    .from('webhook_events')
    .upsert({
      provider: 'omise',
      event_id: eventId,
      event_type: event.key,
      payload: event,
      status,
      error: error || null,
      processed_at: status === 'processed' || status === 'ignored' || status === 'failed' ? new Date().toISOString() : null,
    }, { onConflict: 'provider,event_id' })
    .select('id, status')
    .single();
  return { eventId, data };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const rawBody = await request.text();
  const signature = request.headers.get('x-omise-signature') || request.headers.get('omise-signature');

  if (!verifyOmiseWebhook(rawBody, signature)) {
    return jsonResponse({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const recorded = await recordWebhookEvent(supabase, event, 'received');

  if (!SUPPORTED_EVENTS.includes(event.key)) {
    await recordWebhookEvent(supabase, event, 'ignored');
    return jsonResponse({ ok: true, ignored: 'unsupported_event' });
  }

  const charge = event.data || {};
  const transactionId = charge.id;
  if (!transactionId) {
    await recordWebhookEvent(supabase, event, 'failed', 'missing_transaction_id');
    return jsonResponse({ error: 'Missing transaction id' }, { status: 400 });
  }

  try {
    if (event.key === 'charge.complete') {
      const { data: existing } = await supabase
        .from('payments')
        .select('id, status, reservation_id, amount, currency')
        .eq('gateway_transaction_id', transactionId)
        .single();

      if (!existing) {
        await recordWebhookEvent(supabase, event, 'ignored', 'payment_not_found');
        return jsonResponse({ ok: true, ignored: 'payment_not_found' });
      }

      const webhookAmount = typeof charge.amount === 'number' ? charge.amount / 100 : null;
      if (webhookAmount != null && Math.abs(Number(existing.amount) - webhookAmount) > 0.01) {
        await recordWebhookEvent(supabase, event, 'failed', 'amount_mismatch');
        return jsonResponse({ error: 'Amount mismatch' }, { status: 400 });
      }

      const nextStatus = charge.status === 'successful' ? 'completed' : 'failed';
      const { data: payment } = await supabase
        .from('payments')
        .update({
          status: nextStatus,
          paid_at: charge.status === 'successful' ? (charge.paid_at || new Date().toISOString()) : null,
          gateway_response: charge,
          provider_event_id: recorded.eventId,
          provider_event_type: event.key,
        })
        .eq('id', existing.id)
        .select('reservation_id, amount, status')
        .single();

      if (payment?.reservation_id && charge.status === 'successful' && existing.status !== 'completed') {
        const { data: resv } = await supabase.from('reservations').select('paid_amount, hotel_id').eq('id', payment.reservation_id).single();
        if (resv) {
          const { error: applyError } = await supabase.rpc('apply_reservation_payment', {
            p_reservation_id: payment.reservation_id,
            p_amount: Number(payment.amount || 0),
          });
          if (applyError) logError('omise_webhook_apply_payment_failed', applyError, { requestId, reservationId: payment.reservation_id, paymentId: existing.id });
          await supabase.from('audit_logs').insert({
            hotel_id: resv.hotel_id,
            action: 'payment.webhook.completed',
            entity_type: 'payment',
            entity_id: existing.id,
            changes: { gateway: 'omise', transactionId, providerEventId: recorded.eventId },
          });
        }
      }
    }

    if (event.key === 'refund.create') {
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount: Number(charge.amount || 0) / 100,
          provider_event_id: recorded.eventId,
          provider_event_type: event.key,
        })
        .eq('gateway_transaction_id', charge.charge);
    }

    await recordWebhookEvent(supabase, event, 'processed');
    logEvent('info', 'omise_webhook_processed', { requestId, eventKey: event.key, transactionId });
    return jsonResponse({ ok: true, requestId });
  } catch (error: any) {
    await recordWebhookEvent(supabase, event, 'failed', error.message);
    logError('omise_webhook_processing_failed', error, { requestId, eventKey: event?.key });
    return jsonResponse({ error: 'Webhook processing failed', requestId }, { status: 500 });
  }
}
