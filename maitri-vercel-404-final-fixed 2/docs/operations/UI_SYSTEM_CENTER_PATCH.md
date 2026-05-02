# UI System Center Patch

## What changed

- Added `/dashboard/settings` as a full System Center instead of a small hotel settings page.
- Added centralized asset and icon registry:
  - `src/lib/assets/registry.ts`
  - `public/brand/*`
  - `public/hospitality/*`
  - `public/integrations/*`
- Added theme provider and UI controls:
  - `src/components/providers/theme-provider.tsx`
  - `src/components/ui/theme-toggle.tsx`
- Added localization foundation:
  - `src/lib/i18n/dictionaries.ts`
  - `src/components/providers/locale-provider.tsx`
  - `src/components/ui/language-switcher.tsx`
- Added professional motion/responsive utility classes in `src/app/globals.css`.
- Added production database foundation:
  - `supabase/migrations/00005_ui_system_center_settings.sql`
- Updated top bar, sidebar, and mobile nav for responsive controls.

## Important production note

This patch creates the UI/control foundation and DB schema. For a complete live SaaS implementation, wire these UI controls to server actions/API routes so every setting change is validated, audited, and permission-checked.

## Recommended next implementation

1. Add server APIs for `tenant_feature_flags`, `tenant_branding_settings`, `tenant_locale_settings`, and `tenant_integration_settings`.
2. Add role checks: owner/admin can change settings, staff can only read.
3. Add audit logs for every toggle and integration secret update.
4. Store uploaded images in Supabase Storage or CDN.
5. Connect module flags to route-level feature gating.
6. Add route-based i18n if SEO/public booking localization is required.
