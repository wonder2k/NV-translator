/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启这个可以避免某些第三方库在服务器端报错
  serverExternalPackages: ['xlsx'],
  // 允许在开发环境忽略某些 ESLint 警告以加快部署速度
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
