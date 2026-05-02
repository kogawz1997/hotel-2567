# Vercel Root 404 Fix

This patch fixes the preview deployment showing `404: NOT_FOUND` at the root domain.

## What changed

- Added a robust `src/app/page.tsx` root landing page.
- Added `src/app/not-found.tsx` so unknown routes show a useful in-app page.
- Adjusted `next.config.js` so `output: standalone` is disabled on Vercel and kept for Docker/non-Vercel builds.
- Kept mock service environment variables in `vercel.json` for preview testing.

## Important Vercel settings

If Vercel still shows 404, check this first:

- Project Root Directory must point to the folder that contains `package.json`.
- If you upload the repo with a wrapper folder, set Root Directory to that folder, for example `hotel-pms-v2`.
- If this zip is extracted directly into the repo root, Root Directory should be empty/default.

## Test URLs

- `/`
- `/dashboard`
- `/dashboard/settings`
- `/booking/demo`
- `/api/mock/status`
