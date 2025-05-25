/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ────────────────────────────────────────────────────────────────
  // proxy any /api/* request from the browser to FastAPI :8000
  // ────────────────────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: '/api/:path*',                 // what the browser hits
        destination: 'http://127.0.0.1:8000//:path*', // FastAPI
      },
    ];
  },
};

export default nextConfig;
