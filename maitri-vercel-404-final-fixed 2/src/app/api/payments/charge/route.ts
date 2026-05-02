import { z } from 'zod';
import { getPaymentAdapter } from '@/lib/payments';
import { parseJson } from '@/lib/http/validation';
import { assertReservationAccess } from '@/lib/auth/guards';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { jsonResponse } from '@/lib/http/response';
import { getAuditActor, writeAuditLog } from '@/lib/audit';
import { enforceSameOrigin } from '@/lib/security/origin';
import { getRequestId, logError } from '@/lib/observability/logger';

const schema = z.object({
  reservationId: z.string().uuid(),
  amount: z.coerce.number().positive().max(10_000_000),
  method: z.enum(['credit_card', 'promptpay', 'truemoney', 'shopeepay', 'bank_transfer']),
  description: z.string().max(255).optional(),
  cardToken: z.string().max(255).optional(),
  idempotencyKey: z.string().trim().min(12).max(120).optional(),
});

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const originError = enforceSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, 'payments.charge', 15, 60_000);
  if (limited) return limited;

  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;
  const { reservationId, amount, method, description, cardToken } = parsed.data;
  const idempotencyKey = parsed.data.idempotencyKey || request.headers.get('idempotency-key') || undefined;

  const ctx = await assertReservationAccess(reservationId);
  if (ctx.error || !ctx.reservation) return ctx.error;
  const supabase = ctx.supabase;
  const reservation = ctx.reservation;

  const balance = Math.max(0, Number(reservation.total_amount) - Number(reservation.paid_amount || 0));
  if (balance <= 0) return jsonResponse({ error: 'Reservation is already fully paid' }, { status: 400 });
  if (amount > balance) return jsonResponse({ error: 'Amount exceeds reservation balance', balance }, { status: 400 });

  if (idempotencyKey) {
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('hotel_id', reservation.hotel_id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existingPayment) return jsonResponse({ success: true, payment: existingPayment, idempotent: true });
  }

  const adapter = getPaymentAdapter('omise');

  try {
    const result = await adapter.charge({
      amount,
      currency: reservation.hotels.currency || 'THB',
      description: description || `Booking ${reservation.reservation_code}`,
      method,
      reservationId,
      metadata: { ...(cardToken ? { cardToken } : {}), ...(idempotencyKey ? { idempotencyKey } : {}) },
    });

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        hotel_id: reservation.hotel_id,
        reservation_id: reservationId,
        amount,
        currency: reservation.hotels.currency || 'THB',
        payment_method: method,
        status: result.status === 'completed' ? 'completed' : 'pending',
        gateway: 'omise',
        gateway_transaction_id: result.transactionId,
        gateway_response: result.raw,
        idempotency_key: idempotencyKey || null,
        paid_at: result.status === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (paymentError) return jsonResponse({ error: paymentError.message }, { status: 500 });

    if (result.status === 'completed') {
      const { error: applyError } = await supabase.rpc('apply_reservation_payment', {
        p_reservation_id: reservationId,
        p_amount: amount,
      });
      if (applyError) {
        logError('payment_apply_failed', applyError, { requestId, reservationId, paymentId: payment.id });
      }
    }

    await writeAuditLog(supabase, {
      hotelId: reservation.hotel_id,
      action: 'payment.created',
      entityType: 'payment',
      entityId: payment.id,
      actor: getAuditActor(request, ctx.user!.id),
      changes: { amount, method, status: result.status, idempotencyKey },
    });

    return jsonResponse({ success: true, payment, qrCode: result.qrCode, paymentUrl: result.paymentUrl, requestId });
  } catch (error: any) {
    logError('payment_charge_failed', error, { requestId, reservationId, method });
    return jsonResponse({ error: error.message, requestId }, { status: 500 });
  }
}
