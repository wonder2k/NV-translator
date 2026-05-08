import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  const { items, sourceLang, targetLang } = await req.json();

  // 针对物流场景的系统提示词
  const systemPrompt = `你是一名专业的国际物流翻译专家。
任务：将提供的物流数据（地址、姓名、货物）从 ${sourceLang} 翻译成 ${targetLang}。
要求：
1. 地址翻译：必须保持当地邮政可识别的格式，如果是翻译成英文，请遵循从门牌号到国家的顺序。
2. 人名翻译：保持拼写专业，符合清关要求。
3. 物品名称：翻译为目标国海关通用的商业术语。
4. 输出格式：直接返回JSON数组，不要包含任何解释。格式如：["结果1", "结果2"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "minimax/minimax-text-01", // 对应 MiniMax 2.7 系列
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(items) }
      ],
      temperature: 0.1, // 降低随机性，保证翻译准确
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const results = JSON.parse(content || "{}");
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "翻译接口调用失败" }, { status: 500 });
  }
}
