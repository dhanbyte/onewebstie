/** @type {import('next').NextConfig} */
const nextConfig = {
  srcDir: true,
  outputFileTracingRoot: __dirname,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app', 'shopwave.social', '*.shopwave.social']
    }
  },
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'ik.imagekit.io',
      'shopwave.b-cdn.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    NEXT_PUBLIC_PHONEPE_MERCHANT_ID: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID,
    PHONEPE_SALT_KEY: process.env.PHONEPE_SALT_KEY,
    PHONEPE_SALT_INDEX: process.env.PHONEPE_SALT_INDEX,
    PHONEPE_MODE: process.env.PHONEPE_MODE
  },
}

module.exports = nextConfig