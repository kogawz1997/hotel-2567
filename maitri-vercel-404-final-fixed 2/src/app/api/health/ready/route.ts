import { createAdminClient } from '@/lib/supabase/server';
import { getEnv } from '@/lib/env';
import { jsonResponse } from '@/lib/http/response';

export async function GET() {
  try {
    getEnv();
    const supabase = createAdminClient();
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) return jsonResponse({ ok: false, status: 'db_error' }, { status: 503 });
    return jsonResponse({ ok: true, service: 'maitri-pms', status: 'ready' });
  } catch (error: any) {
    return jsonResponse({ ok: false, status: 'not_ready', error: error.message }, { status: 503 });
  }
}
