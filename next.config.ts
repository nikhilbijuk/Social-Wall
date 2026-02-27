import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'bb81ol5n6a.ufs.sh',
        port: '',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
