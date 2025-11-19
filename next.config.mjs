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
      {
        source: '/etf-tracker',
        destination: 'https://etf-tracker-five.vercel.app',
      },
      {
        source: '/etf-tracker/:path*',
        destination: 'https://etf-tracker-five.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
