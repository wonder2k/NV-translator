import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 延长 Vercel 超时限制

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const { items, sourceLang, targetLang, model } = await req.json();

    const systemPrompt = `你是一个精准的物流数据翻译器。
任务：将用户提供的物流条目从 ${sourceLang} 翻译为 ${targetLang}。
输入格式：每一行可能包含“地址、人名、物品名称”，它们以“、”或“;”分隔。
输出要求：
1. 必须完整保留输入的所有部分，严禁丢弃人名或物品名。
2. 地址：严格遵守目的地国家的邮政格式（如：日本地址需保留邮编，转为汉字/数字混排）。
3. 人名：进行准确的音译或意译。
4. 品名：使用通用的商业贸易术语。
5. 格式控制：每一行输出必须与输入行一一对应。严禁输出任何解释、注释或多余的标点。
6. 响应速度优化：直接输出翻译结果，不要思考过程。`;

    const response = await openai.chat.completions.create({
      model: model || "minimaxai/minimax-m2.7",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: items.join('\n') }
      ],
      temperature: 0, // 设为 0 以获得最高确定性和最快速度
      top_p: 1,
    });

    const translatedText = response.choices[0]?.message?.content || '';
    
    // 逻辑：将返回的文本按行分割，确保与输入行数一致
    const results = translatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
