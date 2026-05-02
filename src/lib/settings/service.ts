import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_BRANDING, DEFAULT_FEATURE_FLAGS, DEFAULT_INTEGRATIONS, DEFAULT_LOCALE } from './defaults';
import type { BrandingSetting, FeatureFlag, IntegrationSetting, LocaleSetting } from './defaults';

export type TenantSystemSettings = {
  hotelId: string;
  organizationId: string;
  features: FeatureFlag[];
  integrations: IntegrationSetting[];
  branding: BrandingSetting;
  locale: LocaleSetting;
};

export async function getTenantSystemSettings(supabase: SupabaseClient, hotel: { id: string; organization_id: string; name?: string | null; currency?: string | null; timezone?: string | null; }) : Promise<TenantSystemSettings> {
  const [flagsResult, brandingResult, localeResult, integrationsResult] = await Promise.all([
    supabase.from('tenant_feature_flags').select('*').eq('organization_id', hotel.organization_id).eq('hotel_id', hotel.id),
    supabase.from('tenant_branding_settings').select('*').eq('organization_id', hotel.organization_id).eq('hotel_id', hotel.id).maybeSingle(),
    supabase.from('tenant_locale_settings').select('*').eq('organization_id', hotel.organization_id).eq('hotel_id', hotel.id).maybeSingle(),
    supabase.from('tenant_integration_settings').select('*').eq('organization_id', hotel.organization_id).eq('hotel_id', hotel.id),
  ]);

  const flagMap = new Map((flagsResult.data || []).map((row: any) => [row.feature_key, row]));
  const integrationMap = new Map((integrationsResult.data || []).map((row: any) => [row.integration_key, row]));
  const brandingRow: any = brandingResult.data;
  const localeRow: any = localeResult.data;

  return {
    hotelId: hotel.id,
    organizationId: hotel.organization_id,
    features: DEFAULT_FEATURE_FLAGS.map((item) => {
      const row: any = flagMap.get(item.key);
      return { ...item, enabled: row?.enabled ?? item.enabled, required: item.required || row?.locked || false };
    }),
    integrations: DEFAULT_INTEGRATIONS.map((item) => {
      const row: any = integrationMap.get(item.key);
      return {
        ...item,
        enabled: row?.enabled ?? item.enabled,
        status: row?.status ?? item.status,
        publicConfig: row?.public_config ?? item.publicConfig ?? {},
      };
    }),
    branding: {
      ...DEFAULT_BRANDING,
      brandName: brandingRow?.brand_name || hotel.name || DEFAULT_BRANDING.brandName,
      logoUrl: brandingRow?.logo_url || DEFAULT_BRANDING.logoUrl,
      heroImageUrl: brandingRow?.hero_image_url || DEFAULT_BRANDING.heroImageUrl,
      faviconUrl: brandingRow?.favicon_url || DEFAULT_BRANDING.faviconUrl,
      primaryColor: brandingRow?.primary_color || DEFAULT_BRANDING.primaryColor,
      accentColor: brandingRow?.accent_color || DEFAULT_BRANDING.accentColor,
      radius: brandingRow?.radius || DEFAULT_BRANDING.radius,
      defaultTheme: brandingRow?.default_theme || DEFAULT_BRANDING.defaultTheme,
    },
    locale: {
      ...DEFAULT_LOCALE,
      defaultLocale: localeRow?.default_locale || DEFAULT_LOCALE.defaultLocale,
      enabledLocales: localeRow?.enabled_locales || DEFAULT_LOCALE.enabledLocales,
      timezone: localeRow?.timezone || hotel.timezone || DEFAULT_LOCALE.timezone,
      currency: localeRow?.currency || hotel.currency || DEFAULT_LOCALE.currency,
      documentLocale: localeRow?.document_locale || DEFAULT_LOCALE.documentLocale,
    },
  };
}
