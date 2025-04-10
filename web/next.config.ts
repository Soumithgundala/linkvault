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
    ],
  },
};

module.exports = {
  nextConfig,
  images: {
    domains: [
      'linkpreview.net', // Add domains you expect images from
      'example.com',     // Add other domains as needed
      'via.placeholder.com'

    ],
  },
};