-- Production UI/UX control center support
-- Adds tenant-safe places to store feature flags, branding, localization, and integration status.

create table if not exists tenant_feature_flags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default true,
  locked boolean not null default false,
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, hotel_id, feature_key)
);

create table if not exists tenant_branding_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  brand_name text,
  logo_url text,
  hero_image_url text,
  favicon_url text,
  primary_color text default '#2A2522',
  accent_color text default '#C66A30',
  radius text default '0.625rem',
  default_theme text not null default 'system' check (default_theme in ('light', 'dark', 'system')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, hotel_id)
);

create table if not exists tenant_locale_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  default_locale text not null default 'th',
  enabled_locales text[] not null default array['th','en'],
  timezone text not null default 'Asia/Bangkok',
  currency text not null default 'THB',
  document_locale text not null default 'th',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, hotel_id)
);

create table if not exists tenant_integration_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hotel_id uuid references hotels(id) on delete cascade,
  integration_key text not null,
  status text not null default 'not_configured' check (status in ('not_configured', 'configured', 'connected', 'degraded', 'disabled')),
  enabled boolean not null default false,
  last_checked_at timestamptz,
  public_config jsonb not null default '{}'::jsonb,
  secret_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, hotel_id, integration_key)
);

alter table tenant_feature_flags enable row level security;
alter table tenant_branding_settings enable row level security;
alter table tenant_locale_settings enable row level security;
alter table tenant_integration_settings enable row level security;

drop policy if exists tenant_feature_flags_org_access on tenant_feature_flags;
create policy tenant_feature_flags_org_access on tenant_feature_flags
  for all using (organization_id in (select organization_id from user_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from user_profiles where id = auth.uid()));

drop policy if exists tenant_branding_settings_org_access on tenant_branding_settings;
create policy tenant_branding_settings_org_access on tenant_branding_settings
  for all using (organization_id in (select organization_id from user_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from user_profiles where id = auth.uid()));

drop policy if exists tenant_locale_settings_org_access on tenant_locale_settings;
create policy tenant_locale_settings_org_access on tenant_locale_settings
  for all using (organization_id in (select organization_id from user_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from user_profiles where id = auth.uid()));

drop policy if exists tenant_integration_settings_org_access on tenant_integration_settings;
create policy tenant_integration_settings_org_access on tenant_integration_settings
  for all using (organization_id in (select organization_id from user_profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from user_profiles where id = auth.uid()));

create index if not exists idx_tenant_feature_flags_org_hotel on tenant_feature_flags(organization_id, hotel_id);
create index if not exists idx_tenant_integration_settings_org_hotel on tenant_integration_settings(organization_id, hotel_id);
