import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const npmrc = fs.existsSync('.npmrc') ? fs.readFileSync('.npmrc', 'utf8') : '';
const lockExists = fs.existsSync('package-lock.json');

const problems = [];
if (!lockExists) problems.push('Missing package-lock.json');
if (!String(vercel.installCommand || '').startsWith('npm ci')) problems.push('vercel.json installCommand must use npm ci');
if (!String(vercel.buildCommand || '').includes('build:vercel')) problems.push('vercel.json buildCommand should use npm run build:vercel');
if (!pkg.packageManager?.startsWith('npm@')) problems.push('packageManager should pin npm');
if (!pkg.engines?.node) problems.push('engines.node is missing');
if (!npmrc.includes('audit=false')) problems.push('.npmrc should disable audit');
if (!npmrc.includes('progress=false')) problems.push('.npmrc should disable progress');

if (problems.length) {
  console.error('Vercel install config is not ready:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log('Vercel install config looks ready.');
