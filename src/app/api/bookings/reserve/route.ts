import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { parseJson, dateStringSchema } from '@/lib/http/validation';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { getBookingQuote } from '@/lib/bookings/pricing';
import { jsonResponse } from '@/lib/http/response';
import { getAuditActor, writeAuditLog } from '@/lib/audit';
import { enforceSameOrigin } from '@/lib/security/origin';
import { getRequestId, logError, logEvent } from '@/lib/observability/logger';

const schema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  ratePlanId: z.string().uuid().optional().nullable(),
  checkIn: dateStringSchema,
  checkOut: dateStringSchema,
  numAdults: z.coerce.number().int().min(1).max(20).default(1),
  numChildren: z.coerce.number().int().min(0).max(20).default(0),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional().nullable(),
  email: z.string().email().max(255),
  phone: z.string().trim().min(3).max(40),
  nationality: z.string().trim().max(80).optional().nullable(),
  specialRequests: z.string().max(2000).optional().nullable(),
  marketingConsent: z.coerce.boolean().optional().default(false),
  idempotencyKey: z.string().trim().min(12).max(120).optional().nullable(),
});

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const originError = enforceSameOrigin(request);
  if (originError) return originError;

  const limited = enforceRateLimit(request, 'bookings.reserve', 8, 60_000);
  if (limited) return limited;

  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const supabase = createAdminClient();
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name, public_booking_enabled, public_booking_requires_payment, public_booking_hold_minutes, suspended_at')
    .eq('id', body.hotelId)
    .single();

  if (!hotel || hotel.public_booking_enabled === false || hotel.suspended_at) {
    return jsonResponse({ error: 'Booking is not available for this hotel' }, { status: 404 });
  }

  if (body.idempotencyKey) {
    const { data: existing } = await supabase
      .from('reservations')
      .select('id, reservation_code, status, total_amount, check_in, check_out, expires_at')
      .eq('hotel_id', body.hotelId)
      .eq('idempotency_key', body.idempotencyKey)
      .maybeSingle();
    if (existing) return jsonResponse({ success: true, reservation: existing, idempotent: true });
  }

  const quoteResult = await getBookingQuote(supabase, body);
  if (!quoteResult.ok) return jsonResponse({ error: quoteResult.error, ...quoteResult.details }, { status: quoteResult.status });
  const quote = quoteResult.quote;
  const holdMinutes = Number(hotel.public_booking_hold_minutes || 30);
  const expiresAt = new Date(Date.now() + holdMinutes * 60_000).toISOString();
  const reservationStatus = hotel.public_booking_requires_payment ? 'on_hold' : 'pending';

  let guest: any = null;
  const { data: existingGuest } = await supabase
    .from('guests')
    .select('id')
    .eq('hotel_id', body.hotelId)
    .or(`email.eq.${body.email},phone.eq.${body.phone}`)
    .maybeSingle();
  guest = existingGuest;

  if (!guest) {
    const { data: newGuest, error: guestError } = await supabase
      .from('guests')
      .insert({
        hotel_id: body.hotelId,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        nationality: body.nationality,
        marketing_consent: body.marketingConsent,
      })
      .select('id')
      .single();
    if (guestError) {
      logError('public_booking_guest_create_failed', guestError, { requestId, hotelId: body.hotelId });
      return jsonResponse({ error: 'Unable to create guest', requestId }, { status: 500 });
    }
    guest = newGuest;
  }

  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .insert({
      hotel_id: body.hotelId,
      guest_id: guest.id,
      room_type_id: body.roomTypeId,
      rate_plan_id: body.ratePlanId,
      check_in: body.checkIn,
      check_out: body.checkOut,
      num_adults: body.numAdults,
      num_children: body.numChildren,
      total_amount: quote.totalPrice,
      source: 'website',
      special_requests: body.specialRequests,
      status: reservationStatus,
      expires_at: expiresAt,
      idempotency_key: body.idempotencyKey || null,
    })
    .select('id, reservation_code, status, total_amount, check_in, check_out, expires_at')
    .single();

  if (reservationError) {
    logError('public_booking_reservation_create_failed', reservationError, { requestId, hotelId: body.hotelId });
    return jsonResponse({ error: 'Unable to create reservation', requestId }, { status: 500 });
  }

  const { error: folioError } = await supabase.from('folios').insert({
    reservation_id: reservation.id,
    hotel_id: body.hotelId,
    status: 'open',
    total_charges: quote.totalPrice,
    balance: quote.totalPrice,
  });

  if (folioError) {
    logError('public_booking_folio_create_failed', folioError, { requestId, hotelId: body.hotelId, reservationId: reservation.id });
  }

  await writeAuditLog(supabase, {
    hotelId: body.hotelId,
    action: 'public_booking.created',
    entityType: 'reservation',
    entityId: reservation.id,
    actor: getAuditActor(request),
    changes: { source: 'website', totalAmount: quote.totalPrice, nights: quote.nights },
  });

  logEvent('info', 'public_booking_created', { requestId, hotelId: body.hotelId, reservationId: reservation.id, paymentRequired: hotel.public_booking_requires_payment });

  return jsonResponse({
    success: true,
    reservation,
    quote,
    paymentRequired: Boolean(hotel.public_booking_requires_payment),
    holdExpiresAt: expiresAt,
    requestId,
  });
}
