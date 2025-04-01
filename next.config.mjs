/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: () => [
    {
      source: '/download/:model',
      destination: '/api/download/:model'
    }
  ]
};

export default nextConfig;
