import { z } from 'zod';

export const normalizedOtaReservationSchema = z.object({
  provider: z.enum(['booking_com', 'agoda', 'airbnb', 'expedia', 'other']),
  externalId: z.string().min(1),
  hotelId: z.string().uuid().optional(),
  roomTypeCode: z.string().min(1).optional(),
  ratePlanCode: z.string().min(1).optional(),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional().default(''),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    nationality: z.string().optional(),
  }),
  stay: z.object({
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    adults: z.number().int().min(1).default(1),
    children: z.number().int().min(0).default(0),
  }),
  amount: z.object({
    total: z.number().nonnegative(),
    currency: z.string().length(3).default('THB'),
  }),
  status: z.enum(['confirmed', 'cancelled', 'modified']).default('confirmed'),
  raw: z.unknown(),
});

export type NormalizedOtaReservation = z.infer<typeof normalizedOtaReservationSchema>;

export function parseGenericOtaPayload(provider: NormalizedOtaReservation['provider'], payload: unknown) {
  const source = payload as any;
  const reservation = source?.reservation || source?.booking || source;
  const guest = reservation?.guest || reservation?.customer || {};
  const stay = reservation?.stay || reservation?.dates || reservation;
  const amount = reservation?.amount || reservation?.price || reservation?.total || {};

  return normalizedOtaReservationSchema.safeParse({
    provider,
    externalId: String(reservation?.externalId || reservation?.external_id || reservation?.id || reservation?.booking_id || ''),
    hotelId: reservation?.hotelId || reservation?.hotel_id,
    roomTypeCode: reservation?.roomTypeCode || reservation?.room_type_code || reservation?.room_type,
    ratePlanCode: reservation?.ratePlanCode || reservation?.rate_plan_code || reservation?.rate_plan,
    guest: {
      firstName: guest.firstName || guest.first_name || guest.given_name || guest.name?.split(' ')?.[0] || 'OTA Guest',
      lastName: guest.lastName || guest.last_name || guest.family_name || guest.name?.split(' ')?.slice(1).join(' ') || '',
      email: guest.email || undefined,
      phone: guest.phone || guest.telephone || undefined,
      nationality: guest.nationality || undefined,
    },
    stay: {
      checkIn: stay.checkIn || stay.check_in || stay.arrival || stay.arrival_date,
      checkOut: stay.checkOut || stay.check_out || stay.departure || stay.departure_date,
      adults: Number(stay.adults || stay.num_adults || reservation?.adults || 1),
      children: Number(stay.children || stay.num_children || reservation?.children || 0),
    },
    amount: {
      total: Number(amount.total || amount.amount || reservation?.total_amount || 0),
      currency: amount.currency || reservation?.currency || 'THB',
    },
    status: reservation?.status === 'cancelled' ? 'cancelled' : reservation?.status === 'modified' ? 'modified' : 'confirmed',
    raw: payload,
  });
}
