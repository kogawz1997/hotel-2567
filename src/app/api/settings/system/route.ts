import { z } from 'zod';
import { requireHotelAccess } from '@/lib/auth/guards';
import { parseJson } from '@/lib/http/validation';
import { jsonResponse } from '@/lib/http/response';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { enforceSameOrigin } from '@/lib/security/origin';
import { getTenantSystemSettings } from '@/lib/settings/service';
import { DEFAULT_FEATURE_FLAGS, DEFAULT_INTEGRATIONS } from '@/lib/settings/defaults';
import { getAuditActor, writeAuditLog } from '@/lib/audit';

const featureSchema = z.object({ key: z.string().min(2).max(80), enabled: z.boolean() });
const integrationSchema = z.object({
  key: z.string().min(2).max(80),
  enabled: z.boolean(),
  status: z.enum(['not_configured', 'configured', 'connected', 'degraded', 'disabled']).optional(),
  publicConfig: z.record(z.unknown()).optional(),
});
const brandingSchema = z.object({
  brandName: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().max(500).optional().default(''),
  heroImageUrl: z.string().trim().max(500).optional().default(''),
  faviconUrl: z.string().trim().max(500).optional().default(''),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  radius: z.string().trim().max(32).default('0.75rem'),
  defaultTheme: z.enum(['light', 'dark', 'system']),
}).partial();
const localeSchema = z.object({
  defaultLocale: z.enum(['th', 'en', 'zh', 'ja']),
  enabledLocales: z.array(z.enum(['th', 'en', 'zh', 'ja'])).min(1),
  timezone: z.string().trim().min(2).max(80),
  currency: z.string().trim().length(3),
  documentLocale: z.enum(['th', 'en', 'zh', 'ja']),
}).partial();
const patchSchema = z.object({
  hotelId: z.string().uuid(),
  features: z.array(featureSchema).optional(),
  integrations: z.array(integrationSchema).optional(),
  branding: brandingSchema.optional(),
  locale: localeSchema.optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hotelId = url.searchParams.get('hotelId');
  const ctx = await requireHotelAccess(hotelId, ['owner', 'admin', 'manager']);
  if (ctx.error || !ctx.hotel || !ctx.profile) return ctx.error;

  const settings = await getTenantSystemSettings(ctx.supabase as any, ctx.hotel as any);
  return jsonResponse({ settings });
}

export async function PATCH(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) return originError;
  const limited = enforceRateLimit(request, 'settings.system', 30, 60_000);
  if (limited) return limited;

  const parsed = await parseJson(request, patchSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;
  const ctx = await requireHotelAccess(body.hotelId, ['owner', 'admin', 'manager']);
  if (ctx.error || !ctx.hotel || !ctx.profile || !ctx.user) return ctx.error;

  const organizationId = ctx.profile.organization_id;
  const hotelId = ctx.hotel.id;
  const featureDefaults = new Map(DEFAULT_FEATURE_FLAGS.map((item) => [item.key, item]));
  const integrationDefaults = new Map(DEFAULT_INTEGRATIONS.map((item) => [item.key, item]));

  if (body.features?.length) {
    const rows = body.features.map((item) => {
      const defaults = featureDefaults.get(item.key);
      return {
        organization_id: organizationId,
        hotel_id: hotelId,
        feature_key: item.key,
        enabled: defaults?.required ? true : item.enabled,
        locked: defaults?.required ?? false,
        source: 'system_center',
        updated_at: new Date().toISOString(),
      };
    });
    const { error } = await ctx.supabase.from('tenant_feature_flags').upsert(rows, { onConflict: 'organization_id,hotel_id,feature_key' });
    if (error) return jsonResponse({ error: error.message }, { status: 500 });
  }

  if (body.integrations?.length) {
    const rows = body.integrations.map((item) => {
      const defaults = integrationDefaults.get(item.key);
      const enabled = item.enabled;
      return {
        organization_id: organizationId,
        hotel_id: hotelId,
        integration_key: item.key,
        enabled,
        status: enabled ? (item.status || 'configured') : 'disabled',
        public_config: item.publicConfig || {},
        metadata: { name: defaults?.name, category: defaults?.category, envKey: defaults?.envKey },
        updated_at: new Date().toISOString(),
      };
    });
    const { error } = await ctx.supabase.from('tenant_integration_settings').upsert(rows, { onConflict: 'organization_id,hotel_id,integration_key' });
    if (error) return jsonResponse({ error: error.message }, { status: 500 });
  }

  if (body.branding) {
    const branding = body.branding;
    const { error } = await ctx.supabase.from('tenant_branding_settings').upsert({
      organization_id: organizationId,
      hotel_id: hotelId,
      brand_name: branding.brandName,
      logo_url: branding.logoUrl,
      hero_image_url: branding.heroImageUrl,
      favicon_url: branding.faviconUrl,
      primary_color: branding.primaryColor,
      accent_color: branding.accentColor,
      radius: branding.radius,
      default_theme: branding.defaultTheme,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,hotel_id' });
    if (error) return jsonResponse({ error: error.message }, { status: 500 });
  }

  if (body.locale) {
    const locale = body.locale;
    const { error } = await ctx.supabase.from('tenant_locale_settings').upsert({
      organization_id: organizationId,
      hotel_id: hotelId,
      default_locale: locale.defaultLocale,
      enabled_locales: locale.enabledLocales,
      timezone: locale.timezone,
      currency: locale.currency,
      document_locale: locale.documentLocale,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,hotel_id' });
    if (error) return jsonResponse({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(ctx.supabase, {
    hotelId,
    action: 'settings.system.updated',
    entityType: 'tenant_settings',
    entityId: hotelId,
    actor: getAuditActor(request, ctx.user.id),
    changes: { sections: Object.keys(body).filter((key) => key !== 'hotelId') },
  });

  const settings = await getTenantSystemSettings(ctx.supabase as any, ctx.hotel as any);
  return jsonResponse({ success: true, settings });
}
