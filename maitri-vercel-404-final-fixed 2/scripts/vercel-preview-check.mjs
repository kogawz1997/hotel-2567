import fs from 'node:fs';

const mustExist = [
  'vercel.json',
  'src/lib/mock/supabase.ts',
  'src/lib/mock/payment.ts',
  'src/lib/env.ts',
  '.env.vercel-preview.example',
];

const missing = mustExist.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Vercel preview check failed. Missing:', missing.join(', '));
  process.exit(1);
}

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercel.env?.USE_MOCK_SERVICES !== '1' || vercel.env?.NEXT_PUBLIC_USE_MOCK_SERVICES !== '1') {
  console.error('Vercel preview mock mode is not enabled in vercel.json.');
  process.exit(1);
}

console.log('Vercel preview check passed. Mock services are enabled for test deploy.');
