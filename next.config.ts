import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);
 
const nextConfig: NextConfig = {
  output: 'standalone', // Drastically reduces Docker image size by only copying necessary files
  typescript: {
    // Note: It is recommended to run type checking in your CI pipeline or locally before pushing.
    // Disabling type checking during the VPS build prevents RAM starvation and speeds up builds.
    ignoreBuildErrors: true, 
  },
  eslint: {
    // Disabling linting during the VPS build prevents RAM starvation and speeds up builds.
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "http",
        hostname: "**.vercel.app",
      },
    ],
  },
};
 
export default withNextIntl(nextConfig);