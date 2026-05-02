import { calculateNights } from '@/lib/utils';

export type BookingQuoteInput = {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  ratePlanId?: string | null;
};

export type BookingQuote = {
  nights: number;
  totalPrice: number;
  pricePerNight: number;
  available: number;
  breakdown: Array<{ date: string; rate: number }>;
};

export type BookingQuoteResult =
  | { ok: true; quote: BookingQuote }
  | { ok: false; status: number; error: string; details?: Record<string, unknown> };

function eachStayDate(checkIn: string, nights: number) {
  const start = new Date(`${checkIn}T00:00:00.000Z`);
  return Array.from({ length: nights }).map((_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export async function getBookingQuote(supabase: any, input: BookingQuoteInput): Promise<BookingQuoteResult> {
  const nights = calculateNights(input.checkIn, input.checkOut);
  if (nights < 1 || nights > 60) {
    return { ok: false, status: 400, error: 'Invalid stay dates', details: { maxNights: 60 } };
  }

  const { data: roomType, error: roomTypeError } = await supabase
    .from('room_types')
    .select('id, hotel_id, base_rate, max_occupancy')
    .eq('id', input.roomTypeId)
    .eq('hotel_id', input.hotelId)
    .single();

  if (roomTypeError || !roomType) return { ok: false, status: 404, error: 'Room type not found' };

  if (input.ratePlanId) {
    const { data: ratePlan } = await supabase
      .from('rate_plans')
      .select('id, active')
      .eq('id', input.ratePlanId)
      .eq('hotel_id', input.hotelId)
      .eq('room_type_id', input.roomTypeId)
      .single();

    if (!ratePlan || ratePlan.active === false) {
      return { ok: false, status: 404, error: 'Rate plan not available' };
    }
  }

  let rateQuery = supabase
    .from('rate_calendar')
    .select('date, rate, available_count, min_stay, max_stay, closed_to_arrival, closed_to_departure')
    .eq('hotel_id', input.hotelId)
    .eq('room_type_id', input.roomTypeId)
    .gte('date', input.checkIn)
    .lt('date', input.checkOut)
    .order('date');

  if (input.ratePlanId) rateQuery = rateQuery.eq('rate_plan_id', input.ratePlanId);
  const { data: rates } = await rateQuery;

  let totalPrice = 0;
  let breakdown: Array<{ date: string; rate: number }> = [];
  let calendarAvailable: number | null = null;

  if (rates && rates.length === nights) {
    for (const r of rates as any[]) {
      const minStay = Number(r.min_stay || 1);
      const maxStay = r.max_stay == null ? null : Number(r.max_stay);
      if (r.closed_to_arrival || r.closed_to_departure || minStay > nights || (maxStay && maxStay < nights)) {
        return { ok: false, status: 409, error: 'Selected dates are restricted', details: { blockedDate: r.date } };
      }
      const availableCount = r.available_count == null ? null : Number(r.available_count);
      if (availableCount != null) calendarAvailable = calendarAvailable == null ? availableCount : Math.min(calendarAvailable, availableCount);
      const rate = Number(r.rate);
      totalPrice += rate;
      breakdown.push({ date: r.date, rate });
    }
  } else {
    const baseRate = Number(roomType.base_rate || 0);
    totalPrice = baseRate * nights;
    breakdown = eachStayDate(input.checkIn, nights).map((date) => ({ date, rate: baseRate }));
  }

  const { data: existingResvs } = await supabase
    .from('reservations')
    .select('id')
    .eq('hotel_id', input.hotelId)
    .eq('room_type_id', input.roomTypeId)
    .lt('check_in', input.checkOut)
    .gt('check_out', input.checkIn)
    .not('status', 'in', '(cancelled,no_show)');

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('hotel_id', input.hotelId)
    .eq('room_type_id', input.roomTypeId)
    .not('status', 'in', '(maintenance,blocked)');

  const physicalAvailable = Math.max(0, (rooms?.length || 0) - (existingResvs?.length || 0));
  const available = calendarAvailable == null ? physicalAvailable : Math.min(physicalAvailable, calendarAvailable);

  if (available < 1) return { ok: false, status: 409, error: 'No rooms available' };

  return {
    ok: true,
    quote: {
      nights,
      totalPrice,
      pricePerNight: nights ? totalPrice / nights : 0,
      available,
      breakdown,
    },
  };
}
