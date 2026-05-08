import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  // 确保 Vercel 环境变量名完全一致
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const { items, sourceLang, targetLang } = await req.json();

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json({ error: "环境变量 NVIDIA_API_KEY 未配置" }, { status: 500 });
    }

    // 针对物流场景优化的指令
    const systemPrompt = `你是一名资深的跨境物流专家。
任务：将提供的物流信息（地址、姓名、品名）从 ${sourceLang} 翻译为 ${targetLang}。
要求：
1. 地址翻译必须符合目的地国家的邮政规范。
2. 仅输出翻译结果，每行一个，不要包含原文，不要包含任何解释或标点前缀。`;

    // 调用英伟达 MiniMax M2.7 模型
    const response = await openai.chat.completions.create({
      model: "minimaxai/minimax-m2.7", // 修正后的模型名称
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: items.join('\n') }
      ],
      temperature: 0.1, // 物流翻译需要低随机性，确保准确
      max_tokens: 4096,
    });

    const translatedText = response.choices[0]?.message?.content || '';
    
    // 处理返回结果：按行切分并清理空行
    const results = translatedText
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // 移除可能的数字列表前缀
      .filter(line => line.length > 0);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: `NVIDIA API 报错: ${error.status || ''} ${error.message}` 
    }, { status: error.status || 500 });
  }
}
