export const MOCK_IDS = {
  organizationId: '11111111-1111-4111-8111-111111111111',
  hotelId: '22222222-2222-4222-8222-222222222222',
  roomTypeId: '33333333-3333-4333-8333-333333333333',
  roomId: '44444444-4444-4444-8444-444444444444',
  guestId: '55555555-5555-4555-8555-555555555555',
  reservationId: '66666666-6666-4666-8666-666666666666',
  userId: '77777777-7777-4777-8777-777777777777',
};

export function createMockUser() {
  return {
    id: MOCK_IDS.userId,
    email: 'owner@maitri.test',
    user_metadata: { full_name: 'Maitri Demo Owner' },
  };
}

export function createMockTables() {
  const now = new Date().toISOString();
  return {
    organizations: [
      { id: MOCK_IDS.organizationId, name: 'Maitri Demo Group', slug: 'maitri-demo', created_at: now },
    ],
    user_profiles: [
      {
        id: MOCK_IDS.userId,
        organization_id: MOCK_IDS.organizationId,
        email: 'owner@maitri.test',
        full_name: 'Maitri Demo Owner',
        role: 'owner',
        active: true,
        organizations: { name: 'Maitri Demo Group' },
      },
    ],
    hotels: [
      {
        id: MOCK_IDS.hotelId,
        organization_id: MOCK_IDS.organizationId,
        name: 'Maitri Boutique Hotel',
        slug: 'demo',
        address: 'Bangkok, Thailand',
        tax_id: '0100000000000',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
        check_in_time: '14:00',
        check_out_time: '12:00',
        vat_rate: 7,
        public_booking_enabled: true,
        public_booking_requires_payment: false,
        public_booking_hold_minutes: 30,
        suspended_at: null,
      },
    ],
    room_types: [
      {
        id: MOCK_IDS.roomTypeId,
        hotel_id: MOCK_IDS.hotelId,
        name: 'Deluxe King',
        description: 'Demo room for Vercel preview testing',
        base_rate: 2200,
        max_occupancy: 2,
        image_url: '/hospitality/room-deluxe.svg',
      },
    ],
    rooms: [
      { id: MOCK_IDS.roomId, hotel_id: MOCK_IDS.hotelId, room_type_id: MOCK_IDS.roomTypeId, room_number: '201', status: 'available' },
      { id: '44444444-4444-4444-8444-444444444445', hotel_id: MOCK_IDS.hotelId, room_type_id: MOCK_IDS.roomTypeId, room_number: '202', status: 'available' },
      { id: '44444444-4444-4444-8444-444444444446', hotel_id: MOCK_IDS.hotelId, room_type_id: MOCK_IDS.roomTypeId, room_number: '203', status: 'cleaning' },
    ],
    guests: [
      { id: MOCK_IDS.guestId, hotel_id: MOCK_IDS.hotelId, first_name: 'Demo', last_name: 'Guest', email: 'guest@maitri.test', phone: '+66000000000' },
    ],
    reservations: [
      {
        id: MOCK_IDS.reservationId,
        hotel_id: MOCK_IDS.hotelId,
        guest_id: MOCK_IDS.guestId,
        room_type_id: MOCK_IDS.roomTypeId,
        reservation_code: 'MT-DEMO-0001',
        check_in: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        check_out: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        status: 'confirmed',
        source: 'website',
        total_amount: 4400,
        paid_amount: 0,
        hotels: { id: MOCK_IDS.hotelId, organization_id: MOCK_IDS.organizationId, currency: 'THB', timezone: 'Asia/Bangkok' },
      },
    ],
    rate_plans: [],
    rate_calendar: [],
    payments: [],
    folios: [],
    audit_logs: [],
    webhook_events: [],
    tenant_feature_flags: [],
    tenant_integration_settings: [],
    tenant_branding_settings: [],
    tenant_locale_settings: [],
    conversations: [],
    messages: [],
    housekeeping_tasks: [],
  } as Record<string, any[]>;
}
