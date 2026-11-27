/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Pre-sized copies in public/img instead of resizing on request.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
  rewrites: () => [
    {
      source: '/download/:model',
      destination: '/api/download/:model'
    }
  ]
};

export default nextConfig;
