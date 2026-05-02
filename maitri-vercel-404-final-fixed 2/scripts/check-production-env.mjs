const mockMode = ['1', 'true', 'yes', 'on'].includes(String(process.env.USE_MOCK_SERVICES || process.env.NEXT_PUBLIC_USE_MOCK_SERVICES || '').toLowerCase());

if (mockMode) {
  console.log('Production env check skipped because USE_MOCK_SERVICES=1. This is OK for Vercel preview only, not live production.');
  process.exit(0);
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'OMISE_SECRET_KEY',
  'OMISE_WEBHOOK_SECRET',
  'WEBHOOK_SHARED_SECRET',
  'AGODA_WEBHOOK_TOKEN',
  'BOOKING_COM_WEBHOOK_TOKEN',
];

const weakValues = ['change-me', 'changeme', 'your-domain', 'xxxxx', 'eyJ...', 'sk_test', 'pkey_test'];
const missing = [];

for (const name of required) {
  const value = process.env[name];
  if (!value || weakValues.some((weak) => value.includes(weak))) missing.push(name);
}

if (process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://')) {
  missing.push('NEXT_PUBLIC_APP_URL must use https:// in production');
}

for (const name of ['WEBHOOK_SHARED_SECRET', 'AGODA_WEBHOOK_TOKEN', 'BOOKING_COM_WEBHOOK_TOKEN']) {
  const value = process.env[name] || '';
  if (value && value.length < 32) missing.push(`${name} must be at least 32 characters`);
}

if (missing.length) {
  console.error('Production env check failed:');
  for (const name of missing) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Production env check passed.');
