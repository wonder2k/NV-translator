# 物流信息 AI 翻译 MVP (NVIDIA + MiniMax)

这是一个基于 NVIDIA NIM 平台的物流翻译工具原型，专门优化了地址、姓名和物品名称的翻译效果。

## 功能特性
- **地址规范化**：通过定制 System Prompt，确保地址符合目标国邮寄习惯。
- **批量处理**：支持多行文本输入和 Excel 文件一键翻译。
- **快速部署**：完美适配 Vercel 自动化部署流程。

## 本地开发
1. 克隆代码。
2. 运行 `npm install`。
3. 在根目录创建 `.env.local` 文件，添加：
   `NVIDIA_API_KEY=你的英伟达API密钥`
4. 运行 `npm run dev`。

## 部署说明
1. 将项目推送到 GitHub。
2. 在 Vercel 中导入该仓库。
3. 在 Vercel 项目设置中添加环境变量 `NVIDIA_API_KEY`。
4. 部署完成后即可使用。
