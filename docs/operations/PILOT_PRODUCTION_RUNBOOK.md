# Maitri PMS Pilot Production Runbook

This pass moves the app closer to a controlled production pilot. It is not a magic spell. Real production still needs real credentials, monitoring, backups, and OTA/payment sandbox certification.

## What changed in the ready++ pass

- Added `00004_production_operations_hardening.sql` for payment race-condition safety, OTA de-duplication, operational indexes, and hold-expiry function.
- Added atomic `apply_reservation_payment()` database function so API charge and Omise webhook cannot double-increment `paid_amount`.
- Added `expire_public_booking_holds()` for scheduled cleanup of unpaid public booking holds.
- Added same-origin guard for browser-originated write endpoints in production.
- Added structured JSON logger with request IDs and sensitive-field redaction.
- Added `npm run smoke:prod` to verify required production files and documented env keys exist.
- Public booking now returns `paymentRequired`, `holdExpiresAt`, and `requestId`.

## Required deployment sequence

1. Create Supabase project and set production secrets.
2. Apply migrations in order:
   - `00001_initial_schema.sql`
   - `00002_production_saas_hardening.sql`
   - `00003_production_saas_readiness.sql`
   - `00004_production_operations_hardening.sql`
3. Configure env vars from `.env.example`.
4. Run locally or CI:
   ```bash
   npm install
   npm run smoke:prod
   npm run type-check
   npm run build
   npm run check:prod-env
   ```
5. Deploy to Vercel/Node host.
6. Configure health checks:
   - `/api/health/live`
   - `/api/health/ready`
7. Configure scheduled job every 5 minutes:
   ```sql
   select expire_public_booking_holds();
   ```
8. Test Omise webhook with sandbox event replay.
9. Test public booking idempotency by submitting the same `idempotencyKey` twice.
10. Only enable `public_booking_requires_payment` per hotel after payment flow passes sandbox.

## Pilot-safe feature flags

Recommended default for first pilot hotel:

```sql
update hotels
set
  public_booking_enabled = true,
  public_booking_requires_payment = false,
  public_booking_hold_minutes = 30
where id = '<hotel_id>';
```

After payment sandbox is verified:

```sql
update hotels
set public_booking_requires_payment = true
where id = '<hotel_id>';
```

## Still not fully production until these are done

- OTA XML/JSON mapping must be implemented per provider contract.
- Email/SMS confirmation templates need real sender/domain verification.
- Backups and point-in-time recovery must be enabled in Supabase.
- External Redis/Upstash should replace in-memory rate limit for multi-instance deployments.
- Error tracking should be connected to Sentry or equivalent.
- Payment settlement reconciliation should compare gateway payout reports against `payments`.
