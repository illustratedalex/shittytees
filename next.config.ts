import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        pathname: '/files/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  redirects: async () => [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.shittytees.com',
        },
      ],
      destination: 'https://shittytees.com/:path*',
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      source: '/order/:path*',
      headers: [
        {
          key: 'Referrer-Policy',
          value: 'no-referrer',
        },
        {
          key: 'Cache-Control',
          value: 'private, no-store',
        },
      ],
    },
  ],
};

export default nextConfig;
