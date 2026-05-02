import { jsonResponse } from '@/lib/http/response';

export async function GET() {
  return jsonResponse({ ok: true, service: 'maitri-pms', status: 'live' });
}
