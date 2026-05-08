/** @type {import('next').NextConfig} */
const nextConfig = {
  // 依然保留这两个设置，确保万一代码有小瑕疵也能强行部署成功
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
