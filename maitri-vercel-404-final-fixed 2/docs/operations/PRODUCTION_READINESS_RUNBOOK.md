# Maitri PMS Production SaaS Runbook

## Release gate

Run these commands before deploying:

```bash
npm install
npm run type-check
npm run build
npm run check:prod-env
```

The app must not be deployed if any command fails. Humanity may survive one failed CI run, but your hotel front desk will not survive broken booking payments at midnight.

## Database migrations

Apply migrations in order:

1. `00001_initial_schema.sql`
2. `00002_production_saas_hardening.sql`
3. `00003_production_saas_readiness.sql`

After applying migrations, verify:

- RLS is enabled on tenant tables.
- `webhook_events` receives Omise events.
- `reservations_hotel_idempotency_key_unique` exists.
- `payments_gateway_transaction_unique` exists.
- `reservations_no_room_overlap` exists if direct room assignment is used.

## Production environment

Required production variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `OMISE_SECRET_KEY`
- `OMISE_WEBHOOK_SECRET`
- `WEBHOOK_SHARED_SECRET`
- `AGODA_WEBHOOK_TOKEN`
- `BOOKING_COM_WEBHOOK_TOKEN`

Rules:

- `NEXT_PUBLIC_APP_URL` must be HTTPS in production.
- Webhook tokens must be random 32+ character values.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Smoke test checklist

### Public booking

- Quote endpoint rejects suspended hotels.
- Quote endpoint rejects public booking disabled hotels.
- Quote endpoint returns no availability when rooms are sold out.
- Reserve endpoint returns the same reservation for the same idempotency key.
- Reserve endpoint creates folio and audit log.

### Staff reservation

- Staff cannot create reservations for another organization.
- Total amount is recomputed server-side.
- Room assignment rejects maintenance and blocked rooms.

### Payment

- Payment amount cannot exceed balance.
- Same idempotency key does not create duplicate payments.
- Omise webhook rejects invalid signatures.
- Omise webhook amount mismatch is rejected.
- Duplicate Omise webhook does not double-add `paid_amount`.

### Security

- Dashboard redirects unauthenticated users.
- API responses include `Cache-Control: no-store` for sensitive JSON.
- Security headers exist on HTML/API responses.

## Pilot production recommendation

This build is suitable for a controlled pilot after the smoke tests pass. For full commercial SaaS, add:

- External distributed rate limiting such as Redis/Upstash.
- Error tracking such as Sentry.
- Structured logs and alerting.
- Backups and recovery drills.
- OTA parser certification for Booking.com/Agoda rather than staged webhook logging only.
