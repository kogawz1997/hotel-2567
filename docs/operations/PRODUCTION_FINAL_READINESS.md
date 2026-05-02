# Maitri PMS Production Final Readiness

This patch turns the System Center from a visual mock into an API-backed tenant control plane.

## What is wired now

- `/dashboard/settings` reads tenant feature flags, branding, locale, and integration status from Supabase.
- `PATCH /api/settings/system` persists feature toggles, integration enablement, branding, and locale settings.
- Required modules are locked server-side.
- Updates are role-gated to `owner`, `admin`, and `manager`.
- Writes are protected by same-origin guard, rate limit, validation, and audit logging.
- `00006_system_center_backend_complete.sql` adds triggers, launch checks, and a defaults helper function.

## Run order

```bash
npm install
supabase db push
npm run type-check
npm run build
npm run check:prod-env
npm run smoke:prod
```

## After migration

For every hotel, run:

```sql
select ensure_tenant_system_defaults('<hotel-id>'::uuid);
```

## Production blockers that still require real credentials

- Omise live keys and webhook secret.
- Agoda/Booking.com real payload parser and certification flow.
- LINE/WhatsApp credentials and callback URLs.
- Supabase Storage bucket/CDN for real hotel photos.
- Manual QA on iPhone, Android, iPad, 1366px desktop, and 1920px front desk screen.

Anything claiming otherwise is just software wearing a fake moustache.
