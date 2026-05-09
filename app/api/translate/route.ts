import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 即使设置了，流式传输也是应对超时的最佳方案

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
6. 响应速度优化：直接输出翻译结果，不要思考过程。
7. 翻译完一行立即输出，不要等待。`;

    const response = await openai.chat.completions.create({
      model: model || "minimaxai/minimax-m2.7",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: items.join('\n') }
      ],
      temperature: 0.1,
      stream: true, // 开启流式输出
    });

    // 创建一个可读流返回给前端
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
