import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/login',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*', // 모든 API 경로에 대해 CORS 헤더를 적용
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://toleave.shop' }, // 프론트 도메인
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Refresh-Token, Content-Type',
          },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Authorization, Refresh-Token',
          },
        ],
      },
      {
        source: '/:path*', // 모든 경로에 대해서도 CORS를 적용
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://toleave.shop' }, // 프론트 도메인
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Authorization, Refresh-Token, Content-Type',
          },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Authorization, Refresh-Token',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
