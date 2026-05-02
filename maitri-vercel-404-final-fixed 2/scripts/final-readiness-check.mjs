import fs from 'node:fs';

const required = [
  'src/app/api/settings/system/route.ts',
  'src/lib/settings/defaults.ts',
  'src/lib/settings/service.ts',
  'src/components/dashboard/settings-client.tsx',
  'supabase/migrations/00006_system_center_backend_complete.sql',
  'docs/operations/PRODUCTION_FINAL_READINESS.md',
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing final readiness files:', missing.join(', '));
  process.exit(1);
}

const settingsClient = fs.readFileSync('src/components/dashboard/settings-client.tsx', 'utf8');
if (!settingsClient.includes('/api/settings/system')) {
  console.error('System Center is not API-backed.');
  process.exit(1);
}

console.log('Final readiness file check passed.');
