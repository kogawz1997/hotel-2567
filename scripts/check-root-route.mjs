import { existsSync } from 'node:fs';

const required = ['src/app/layout.tsx', 'src/app/page.tsx', 'src/app/not-found.tsx', 'package.json', 'vercel.json'];
let ok = true;
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    ok = false;
  } else {
    console.log(`OK ${file}`);
  }
}
if (!ok) process.exit(1);

const extraRequired = [
  'src/app/[[...path]]/page.tsx',
  'index.html',
  'public/index.html',
];
for (const file of extraRequired) {
  if (!existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exitCode = 1;
  } else {
    console.log(`OK ${file}`);
  }
}

console.log('Root route files are ready for Vercel preview.');
