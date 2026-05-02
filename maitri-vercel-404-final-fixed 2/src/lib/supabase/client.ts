import { createBrowserClient } from '@supabase/ssr';
import { createMockSupabaseClient } from '@/lib/mock/supabase';

export function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK_SERVICES === '1' || process.env.NEXT_PUBLIC_USE_MOCK_SERVICES === 'true') {
    return createMockSupabaseClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://maitri-demo.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-for-vercel-preview-only-000000'
  );
}
