#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/app/api/health/live/route.ts',
  'src/app/api/health/ready/route.ts',
  'src/app/api/bookings/quote/route.ts',
  'src/app/api/bookings/reserve/route.ts',
  'src/app/api/payments/charge/route.ts',
  'src/app/api/webhooks/omise/route.ts',
  'src/lib/env.ts',
  'src/lib/security/rate-limit.ts',
  'src/lib/security/origin.ts',
  'src/lib/observability/logger.ts',
  'supabase/migrations/00004_production_operations_hardening.sql',
  'supabase/migrations/00005_ui_system_center_settings.sql',
  'supabase/migrations/00006_system_center_backend_complete.sql',
  'src/app/api/settings/system/route.ts',
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));
if (missing.length) {
  console.error('Missing production files:\n' + missing.map((file) => `- ${file}`).join('\n'));
  process.exit(1);
}

const envExample = readFileSync(join(root, '.env.example'), 'utf8');
const neededEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'OMISE_SECRET_KEY',
  'OMISE_WEBHOOK_SECRET',
  'WEBHOOK_SHARED_SECRET',
];
const missingEnvDocs = neededEnv.filter((key) => !envExample.includes(key));
if (missingEnvDocs.length) {
  console.error('Missing env documentation keys:\n' + missingEnvDocs.map((key) => `- ${key}`).join('\n'));
  process.exit(1);
}

console.log('Production smoke checks passed. Still run npm run type-check && npm run build on a real machine. Obviously, because software enjoys ceremony.');
