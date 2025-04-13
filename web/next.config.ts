/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'linkpreview.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.twing.com'
      }
    ],
    domains: [
      'abs.twimg.com',
      'instagram.com',
      'static.xx.fbcdn.net',
      'platform-lookaside.fbsbx.com',
      'linkpreview.net',
      'example.com',
      'localhost'
    ], // Add all needed domains
    
  },
};

module.exports = nextConfig;