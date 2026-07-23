import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      }
    ],
  },
};

export default nextConfig;
