import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { stockName, stockCode, forecastType, changeMin, changeMax, quarter } = await request.json();

    if (!process.env.QWEN_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI API key not configured' 
      }, { status: 500 });
    }

    // 构建提示词
    const prompt = `请对以下股票业绩预增公告进行简短点评（50字以内）：

股票名称：${stockName}（${stockCode}）
预告类型：${forecastType}
业绩变动：${changeMin}% ~ ${changeMax}%
报告期：${quarter}

请从投资角度给出简洁的分析和建议。`;

    // 调用阿里千问 API
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          max_tokens: 150,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const comment = response.data.output.text;

    return NextResponse.json({ 
      success: true, 
      comment 
    });

  } catch (error: any) {
    console.error('AI comment error:', error.response?.data || error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate AI comment',
      comment: '暂无 AI 点评'
    }, { status: 500 });
  }
}
