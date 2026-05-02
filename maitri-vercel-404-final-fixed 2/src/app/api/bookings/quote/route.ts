import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { parseJson, dateStringSchema } from '@/lib/http/validation';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { getBookingQuote } from '@/lib/bookings/pricing';
import { jsonResponse } from '@/lib/http/response';

const schema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: dateStringSchema,
  checkOut: dateStringSchema,
  ratePlanId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'bookings.quote', 30, 60_000);
  if (limited) return limited;

  const parsed = await parseJson(request, schema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const supabase = createAdminClient();
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, public_booking_enabled, suspended_at')
    .eq('id', body.hotelId)
    .single();

  if (!hotel || hotel.public_booking_enabled === false || hotel.suspended_at) {
    return jsonResponse({ error: 'Booking is not available for this hotel' }, { status: 404 });
  }

  const result = await getBookingQuote(supabase, body);
  if (!result.ok) return jsonResponse({ error: result.error, ...result.details }, { status: result.status });

  return jsonResponse(result.quote);
}
