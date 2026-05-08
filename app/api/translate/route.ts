export const dynamic = 'force-dynamic'; // 确保不被静态缓存
export const maxDuration = 60; // 增加超时时间到60秒（Vercel Pro/Hobby最高支持时间不等）

// 注意：在 App Router 中，目前没有直接像 Pages Router 那样简单配置 bodyParser 的地方。
// 如果 4MB 不够，通常建议将数据分片上传或使用流处理。
// 对于 MVP，我们先保持代码简洁。

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const { items, sourceLang, targetLang } = await req.json();

    // 针对物流场景的 System Prompt 优化
    const systemPrompt = `你是一名资深的跨境物流翻译专家。
任务：将用户提供的地址、人名或物品名称从 ${sourceLang} 翻译为 ${targetLang}。
要求：
1. 地址翻译必须符合目的地国家的邮政规范和书写习惯，确保当地派送员能看懂。
2. 人名请保持音译准确。
3. 物品名称需符合海关申报常用的清晰术语。
4. 仅返回翻译后的文本，不要有任何解释。
5. 如果输入是多行，请按行对应输出。`;

    const response = await openai.chat.completions.create({
      model: "minimax/minimax-text-01", // 请根据NVIDIA面板确认具体模型名
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: items.join('\n') }
      ],
      temperature: 0.1, // 低随机性确保翻译稳定
    });

    const translatedText = response.choices[0].message.content || '';
    const results = translatedText.split('\n').map(s => s.trim());

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
