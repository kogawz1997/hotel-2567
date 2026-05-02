-- System Center backend completion
-- Makes UI control-center tables easier to operate in production and adds safe defaults.

create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tenant_feature_flags_updated_at on tenant_feature_flags;
create trigger trg_tenant_feature_flags_updated_at
before update on tenant_feature_flags
for each row execute function touch_updated_at();

drop trigger if exists trg_tenant_branding_settings_updated_at on tenant_branding_settings;
create trigger trg_tenant_branding_settings_updated_at
before update on tenant_branding_settings
for each row execute function touch_updated_at();

drop trigger if exists trg_tenant_locale_settings_updated_at on tenant_locale_settings;
create trigger trg_tenant_locale_settings_updated_at
before update on tenant_locale_settings
for each row execute function touch_updated_at();

drop trigger if exists trg_tenant_integration_settings_updated_at on tenant_integration_settings;
create trigger trg_tenant_integration_settings_updated_at
before update on tenant_integration_settings
for each row execute function touch_updated_at();

alter table tenant_branding_settings
  add column if not exists storage_bucket text default 'tenant-assets',
  add column if not exists custom_css jsonb not null default '{}'::jsonb;

alter table tenant_locale_settings
  add column if not exists date_format text not null default 'dd/MM/yyyy',
  add column if not exists time_format text not null default 'HH:mm';

alter table tenant_feature_flags
  add constraint tenant_feature_flags_key_format check (feature_key ~ '^[a-zA-Z0-9_.-]+$') not valid;

alter table tenant_integration_settings
  add constraint tenant_integration_settings_key_format check (integration_key ~ '^[a-zA-Z0-9_.-]+$') not valid;

create table if not exists tenant_launch_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hotel_id uuid not null references hotels(id) on delete cascade,
  check_key text not null,
  status text not null default 'pending' check (status in ('pending', 'passed', 'failed', 'waived')),
  severity text not null default 'required' check (severity in ('required', 'recommended', 'info')),
  notes text,
  evidence jsonb not null default '{}'::jsonb,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, hotel_id, check_key)
);

alter table tenant_launch_checks enable row level security;

drop policy if exists tenant_launch_checks_org_access on tenant_launch_checks;
create policy tenant_launch_checks_org_access on tenant_launch_checks
  for all using (organization_id in (select organization_id from user_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from user_profiles where id = auth.uid()));

drop trigger if exists trg_tenant_launch_checks_updated_at on tenant_launch_checks;
create trigger trg_tenant_launch_checks_updated_at
before update on tenant_launch_checks
for each row execute function touch_updated_at();

create index if not exists idx_tenant_launch_checks_org_hotel on tenant_launch_checks(organization_id, hotel_id, status);

create or replace function ensure_tenant_system_defaults(p_hotel_id uuid)
returns void as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from hotels where id = p_hotel_id;
  if v_org is null then
    raise exception 'Hotel not found';
  end if;

  insert into tenant_branding_settings (organization_id, hotel_id, brand_name, logo_url, hero_image_url, favicon_url)
  select v_org, p_hotel_id, h.name, '/brand/maitri-mark.svg', '/hospitality/lobby-hero.svg', '/brand/favicon.svg'
  from hotels h where h.id = p_hotel_id
  on conflict (organization_id, hotel_id) do nothing;

  insert into tenant_locale_settings (organization_id, hotel_id, default_locale, enabled_locales, timezone, currency, document_locale)
  select v_org, p_hotel_id, 'th', array['th','en','zh','ja'], coalesce(h.timezone, 'Asia/Bangkok'), coalesce(h.currency, 'THB'), 'th'
  from hotels h where h.id = p_hotel_id
  on conflict (organization_id, hotel_id) do nothing;

  insert into tenant_feature_flags (organization_id, hotel_id, feature_key, enabled, locked, source)
  values
    (v_org, p_hotel_id, 'bookingEngine', true, true, 'default'),
    (v_org, p_hotel_id, 'reservations', true, true, 'default'),
    (v_org, p_hotel_id, 'reports', true, true, 'default'),
    (v_org, p_hotel_id, 'payments', true, false, 'default'),
    (v_org, p_hotel_id, 'housekeeping', true, false, 'default'),
    (v_org, p_hotel_id, 'inbox', true, false, 'default'),
    (v_org, p_hotel_id, 'channelManager', false, false, 'default'),
    (v_org, p_hotel_id, 'fb', false, false, 'default'),
    (v_org, p_hotel_id, 'spa', false, false, 'default'),
    (v_org, p_hotel_id, 'loyalty', false, false, 'default')
  on conflict (organization_id, hotel_id, feature_key) do nothing;

  insert into tenant_integration_settings (organization_id, hotel_id, integration_key, enabled, status, metadata)
  values
    (v_org, p_hotel_id, 'line', false, 'not_configured', '{"category":"Messaging"}'::jsonb),
    (v_org, p_hotel_id, 'whatsapp', false, 'not_configured', '{"category":"Messaging"}'::jsonb),
    (v_org, p_hotel_id, 'wechat', false, 'not_configured', '{"category":"Messaging"}'::jsonb),
    (v_org, p_hotel_id, 'booking', false, 'not_configured', '{"category":"OTA"}'::jsonb),
    (v_org, p_hotel_id, 'agoda', false, 'not_configured', '{"category":"OTA"}'::jsonb),
    (v_org, p_hotel_id, 'airbnb', false, 'not_configured', '{"category":"OTA"}'::jsonb),
    (v_org, p_hotel_id, 'omise', false, 'not_configured', '{"category":"Payment"}'::jsonb),
    (v_org, p_hotel_id, 'etax', false, 'not_configured', '{"category":"Compliance"}'::jsonb),
    (v_org, p_hotel_id, 'accounting', false, 'not_configured', '{"category":"Accounting"}'::jsonb)
  on conflict (organization_id, hotel_id, integration_key) do nothing;
end;
$$ language plpgsql security definer set search_path = public;
