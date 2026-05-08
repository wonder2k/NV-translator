import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const { items, sourceLang, targetLang } = await req.json();

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json({ error: "环境变量 NVIDIA_API_KEY 缺失" }, { status: 500 });
    }

    const systemPrompt = `你是一名资深的跨境物流专家，精通多国邮政地址规范。
任务：将提供的物流数据从 ${sourceLang} 翻译为 ${targetLang}。
规范：
1. 地址翻译：必须符合目的地国家的官方书写标准（如门牌号、街道、市、省、邮编的顺序）。
2. 人名：使用目的地国家的通用译名或音译，保持读音一致。
3. 品名：使用海关申报中的标准商业术语。
4. 输出格式：仅输出翻译后的内容，每行一个，严禁任何解释性文字。`;

    const response = await openai.chat.completions.create({
      model: "minimax/minimax-01", // 注意：请确保这是英伟达后台目前支持的模型全名
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: items.join('\n') }
      ],
      temperature: 0.1,
    });

    const translatedText = response.choices[0]?.message?.content || '';
    const results = translatedText.split('\n').filter(line => line.trim() !== '');

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('API Error:', error);
    // 向前端抛出具体错误，例如 401 或模型找不到
    return NextResponse.json({ error: error?.message || "服务器内部错误" }, { status: 500 });
  }
}
