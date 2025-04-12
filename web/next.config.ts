/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Instagram configuration
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      // General fallback for any HTTPS image
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    // Security settings
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};