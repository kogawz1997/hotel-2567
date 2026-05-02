# Vercel Fast Deploy Fix

This project is configured to avoid the Vercel `npm install` stall/error:

```txt
npm error Exit handler never called!
```

## What changed

- `vercel.json` now uses `npm ci` instead of `npm install`.
- `package-lock.json` is required and must be committed.
- `.npmrc` disables audit/fund/progress and adds safer retry timeouts.
- Build uses mock services by default for Vercel preview testing.

## Required Vercel settings

In Vercel Project Settings → Build & Development Settings:

```txt
Install Command: npm ci --no-audit --no-fund --progress=false --prefer-offline
Build Command: npm run build:vercel
Node.js Version: 20.x
```

## Required env for preview test

```env
USE_MOCK_SERVICES=1
NEXT_PUBLIC_USE_MOCK_SERVICES=1
MOCK_AUTH_USER=owner
```

## If Vercel still uses npm install

Vercel may keep old settings from the dashboard. Override them manually in Project Settings or redeploy after pushing this file:

```txt
vercel.json
```

## Local verification

```bash
rm -rf node_modules
npm ci --no-audit --no-fund --progress=false
npm run build:vercel
```
