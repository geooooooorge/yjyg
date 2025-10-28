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

    // 构建公告内容
    const announcement = `${stockName}（${stockCode}）发布业绩预告：${forecastType}，业绩变动幅度为${changeMin}%~${changeMax}%，报告期为${quarter}。`;
    
    // 构建提示词
    const prompt = `这是一家上市公司的消息：${announcement}

请判断该消息本身对这个公司的股价有什么影响，用-100到100分来打分，打分权重是对公司营收和利润大幅持续提高的确定性越有利分数越高；如果该公告不是关于公司业绩而是对公司股价有直接影响的请用SABCD来打分（S为超高评价，D为最低评价）。（不显示思考过程，输出简要分析总结，将评分结果写在前）`;

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
