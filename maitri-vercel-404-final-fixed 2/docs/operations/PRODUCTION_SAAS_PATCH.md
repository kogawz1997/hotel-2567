# Production SaaS Patch

This rebuild turns the project from demo-grade PMS into a safer SaaS baseline. It does not claim every OTA integration is fully certified; Agoda and Booking.com remain staged receivers until partner payload parsers are implemented.

## What changed

- Removed invalid brace-expansion folders that confused project structure.
- Added server environment validation in `src/lib/env.ts`.
- Added in-memory request throttling for hot endpoints.
- Added timing-safe secret comparison helpers.
- Added `detectLanguage()` export used by AI and webhook flows.
- Added public booking reservation endpoint `/api/bookings/reserve`.
- Changed the public booking UI to avoid authenticated `/api/reservations`.
- Stopped trusting client-submitted reservation totals in staff reservation API.
- Added production migration `00002_production_saas_hardening.sql`:
  - `hotels.public_booking_enabled`
  - payment idempotency/event columns
  - unique indexes for gateway transactions and idempotency keys
  - `webhook_events` table
  - stricter relation-table RLS `WITH CHECK` policies
- Added `npm run check:prod-env` and `npm run verify` scripts.

## Required before real deployment

1. Run `npm install` locally to generate `package-lock.json`.
2. Run migrations in Supabase, including `00002_production_saas_hardening.sql`.
3. Set real production environment variables.
4. Run:

```bash
npm run type-check
npm run build
npm run check:prod-env
```

## Still staged, not fully production-certified

- Agoda payload parser is not implemented.
- Booking.com payload parser is not implemented.
- External email/notification fulfillment should be verified per provider.
- Rate limit storage is in-memory; use Redis/Upstash for multi-instance deployment.
- Payment reconciliation should be tested with live Omise webhooks before opening to the public.
