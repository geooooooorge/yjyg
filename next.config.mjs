/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/hundsun',
        destination: 'https://hundsun-api-app.vercel.app',
      },
      {
        source: '/hundsun/:path*',
        destination: 'https://hundsun-api-app.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
