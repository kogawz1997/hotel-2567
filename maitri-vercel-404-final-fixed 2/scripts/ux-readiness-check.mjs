import fs from 'node:fs';

const requiredFiles = [
  'src/lib/navigation/dashboard-nav.ts',
  'src/components/layout/sidebar.tsx',
  'src/components/layout/mobile-nav.tsx',
  'src/components/layout/top-bar.tsx',
  'src/components/dashboard/page-shell.tsx',
  'src/components/dashboard/metric-card.tsx',
  'src/app/dashboard/page.tsx',
  'docs/ux/UI_UX_REWORK.md',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing UX files:', missing.join(', '));
  process.exit(1);
}

const sidebar = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf8');
const mobile = fs.readFileSync('src/components/layout/mobile-nav.tsx', 'utf8');
const dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const checks = [
  ['central nav in sidebar', sidebar.includes('DASHBOARD_NAV_GROUPS')],
  ['central nav in mobile', mobile.includes('MOBILE_NAV_ITEMS')],
  ['dashboard shell', dashboard.includes('DashboardPageShell')],
  ['metric cards', dashboard.includes('MetricCard')],
  ['service health panel', dashboard.includes('serviceHealth')],
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error('UX readiness failed:', failed.join(', '));
  process.exit(1);
}

console.log('UX readiness check passed. UI hierarchy, dashboard shell, mobile nav, and design-system pieces are present.');
