/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'instagram.com',
        pathname: '/static/images/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'linkpreview.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
};

module.exports = nextConfig; // Direct export - NO NESTING