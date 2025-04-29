/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // 禁用静态优化，解决certificate页面的预渲染问题
  experimental: {
    disableOptimizedLoading: true
  }
};

module.exports = nextConfig; 