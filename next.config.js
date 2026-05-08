/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允许处理较大的 Excel 数据流
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
