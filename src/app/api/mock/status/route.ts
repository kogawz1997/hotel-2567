import { jsonResponse } from '@/lib/http/response';
import { isMockServicesEnabled } from '@/lib/env';
import { MOCK_IDS } from '@/lib/mock/data';

export async function GET() {
  return jsonResponse({
    mockServices: isMockServicesEnabled(),
    warning: 'Mock mode is for Vercel preview/testing only. Turn it off before real production.',
    toggles: {
      USE_MOCK_SERVICES: process.env.USE_MOCK_SERVICES || '0',
      NEXT_PUBLIC_USE_MOCK_SERVICES: process.env.NEXT_PUBLIC_USE_MOCK_SERVICES || '0',
    },
    fakeKeysLoaded: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      omisePublicKey: Boolean(process.env.OMISE_PUBLIC_KEY),
      omiseSecretKey: Boolean(process.env.OMISE_SECRET_KEY),
      webhookSharedSecret: Boolean(process.env.WEBHOOK_SHARED_SECRET),
    },
    demo: {
      dashboard: '/dashboard',
      booking: '/booking/demo',
      settings: '/dashboard/settings',
      hotelId: MOCK_IDS.hotelId,
      roomTypeId: MOCK_IDS.roomTypeId,
      reservationId: MOCK_IDS.reservationId,
    },
  });
}
