/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => {
    const apiRewriteTarget = process.env.API_REWRITE_TARGET || 'http://localhost:5000/api/:path*';
    return [
      {
        source: '/api/:path*',
        destination: apiRewriteTarget,
      },
    ];
  },
}

module.exports = nextConfig
