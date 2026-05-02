# Fix Vercel 404 Now

This package includes three layers so the preview URL stops showing Vercel `404: NOT_FOUND`:

1. `src/app/page.tsx` for `/`
2. `src/app/[[...path]]/page.tsx` as an App Router fallback for unknown paths
3. `index.html` and `public/index.html` as a static safety fallback if Vercel is pointed at the wrong project root or mis-detects the framework

## Vercel settings that must be correct

Project Settings → General:

- Framework Preset: `Next.js`
- Root Directory: leave empty / project root
- Install Command: `npm ci --no-audit --no-fund --progress=false --prefer-offline`
- Build Command: `npm run build:vercel`
- Output Directory: leave empty
- Node.js Version: `20.x`

## Quick diagnosis

Open these URLs after redeploy:

- `/`
- `/api/mock/status`
- `/dashboard`
- `/booking/demo`

If `/api/mock/status` is also `404: NOT_FOUND`, Vercel is not deploying this Next.js project root. Re-import the project or fix Root Directory.

If only `/` fails, the deployment is still using an older commit. Redeploy the latest commit and clear build cache once.
