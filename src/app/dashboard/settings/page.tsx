import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/dashboard/settings-client';
import { getTenantSystemSettings } from '@/lib/settings/service';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, organization_id, email, full_name, role, active')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id || profile.active === false) return null;

  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, name, organization_id, currency, timezone, check_in_time, check_out_time, address, tax_id, vat_rate')
    .eq('organization_id', profile.organization_id)
    .limit(1);

  const hotel = hotels?.[0];
  if (!hotel) return null;

  const settings = await getTenantSystemSettings(supabase as any, hotel as any);
  return <SettingsClient hotel={hotel} profile={profile} initialSettings={settings} />;
}
