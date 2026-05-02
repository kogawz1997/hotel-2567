/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1';

const nextConfig = {
  // Vercel already optimizes Next.js output. Standalone output is useful for Docker,
  // but can create confusing preview deployments when the project root is not set right.
  ...(isVercel ? {} : { output: 'standalone' }),
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
