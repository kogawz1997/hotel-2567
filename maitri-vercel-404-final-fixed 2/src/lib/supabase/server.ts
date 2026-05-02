import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isMockServicesEnabled, requireEnv } from '@/lib/env';
import { createMockSupabaseClient } from '@/lib/mock/supabase';

export async function createClient() {
  if (isMockServicesEnabled()) return createMockSupabaseClient();

  const cookieStore = await cookies();
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createAdminClient() {
  if (isMockServicesEnabled()) return createMockSupabaseClient();

  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
