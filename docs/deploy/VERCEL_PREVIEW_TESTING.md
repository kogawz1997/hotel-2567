# Vercel Preview Testing Mode

This build includes a mock-service mode so the app can be deployed to Vercel and clicked through before real Supabase, Omise, Agoda, Booking.com, LINE, or WhatsApp credentials are ready.

## What is enabled

- `USE_MOCK_SERVICES=1`
- `NEXT_PUBLIC_USE_MOCK_SERVICES=1`
- Mock Supabase auth/user/session
- Mock hotel, room type, rooms, guest, reservation, settings, audit, payment rows
- Mock Omise payment adapter
- Same-origin write guard relaxed for preview testing
- Production env check skips live secret enforcement while mock mode is enabled

## Demo URLs

- Dashboard: `/dashboard`
- Settings / System Center: `/dashboard/settings`
- Public booking: `/booking/demo`
- Live health: `/api/health/live`
- Ready health: `/api/health/ready`

## Easy on/off

### Vercel preview / test

Keep these enabled:

```env
USE_MOCK_SERVICES=1
NEXT_PUBLIC_USE_MOCK_SERVICES=1
```

### Real production

Turn both off or remove them:

```env
USE_MOCK_SERVICES=0
NEXT_PUBLIC_USE_MOCK_SERVICES=0
```

Then configure real values in Vercel Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OMISE_PUBLIC_KEY`
- `OMISE_SECRET_KEY`
- `OMISE_WEBHOOK_SECRET`
- `WEBHOOK_SHARED_SECRET`
- OTA webhook tokens

## Safety warning

Mock mode is intentionally fake. It lets you test pages, routes, UI, settings saving, booking flow, and payment-shaped responses. It does not persist real business data and must not be used for a live hotel.
