# Vercel Test Ready Build

This package is prepared for Vercel preview testing with fake/mock services enabled by default.

## Deploy steps

1. Upload/import this repository to GitHub.
2. Import the repo in Vercel.
3. Keep the included `vercel.json` for preview testing.
4. Deploy.

## Test paths

- `/api/mock/status` checks mock keys and demo IDs
- `/api/health/live`
- `/api/health/ready`
- `/dashboard`
- `/dashboard/settings`
- `/booking/demo`

## Mock toggle

Preview mode is enabled by these env vars:

```env
USE_MOCK_SERVICES=1
NEXT_PUBLIC_USE_MOCK_SERVICES=1
```

For real production, set both to `0` or remove them and configure real Supabase/Omise/OTA secrets in Vercel.

## Local checks

```bash
npm install
npm run type-check
npm run check:vercel-test
npm run build:vercel-test
```

The package uses `next@15.5.9` to avoid the old `15.0.3` security warning and reduce preview-build issues. `package-lock.json` is intentionally not included so Vercel installs the patched version declared in `package.json`.
