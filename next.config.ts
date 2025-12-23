import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io', // نسمح فقط لصور Sanity بالدخول
        port: '',
      },
    ],
  },
};

export default nextConfig;