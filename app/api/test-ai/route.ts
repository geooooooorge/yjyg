import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

// 测试 AI API 连接
export async function GET() {
  try {
    if (!process.env.QWEN_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI API key not configured',
        message: '❌ 未配置 QWEN_API_KEY'
      }, { status: 500 });
    }

    const startTime = Date.now();

    // 发送简单的测试问题
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: '请用一句话回答：1+1等于几？'
            }
          ]
        },
        parameters: {
          max_tokens: 50,
          temperature: 0.1
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

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const answer = response.data.output.text;

    return NextResponse.json({ 
      success: true, 
      message: '✅ AI API 连接成功',
      answer: answer,
      responseTime: `${responseTime}ms`,
      model: 'qwen-turbo',
      status: 'online'
    });

  } catch (error: any) {
    console.error('AI test error:', error.response?.data || error.message);
    
    let errorMessage = '❌ AI API 连接失败';
    if (error.code === 'ECONNABORTED') {
      errorMessage = '❌ 请求超时（>10秒）';
    } else if (error.response?.status === 401) {
      errorMessage = '❌ API Key 无效';
    } else if (error.response?.status === 429) {
      errorMessage = '❌ 请求频率超限';
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: error.response?.data?.message || error.message
    }, { status: 500 });
  }
}
