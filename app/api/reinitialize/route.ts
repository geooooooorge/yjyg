import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { fetchEarningsReports } from '@/lib/eastmoney';
import { saveAiComment } from '@/lib/storage';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5分钟超时

// 完全重新初始化整个项目
export async function POST() {
  try {
    console.log('=== Starting complete reinitialization ===');
    
    // 1. 连接 Redis
    const redis = Redis.fromEnv();
    
    // 2. 获取所有 keys 并删除（除了邮箱列表和邮件历史）
    console.log('Step 1: Clearing all cache data...');
    const keysToDelete = [
      'today_new_stocks',
      'stocks_cache',
      'sent_stocks',
      'all_stocks_history',
      'daily_new_stocks',
      'ai_comments'
    ];
    
    // 删除所有匹配的 keys
    for (const key of keysToDelete) {
      await redis.del(key);
      console.log(`Deleted: ${key}`);
    }
    
    // 删除所有带日期的 daily_new_stocks
    const allKeys = await redis.keys('*');
    for (const key of allKeys) {
      if (key.startsWith('daily_new_stocks:') || 
          key.startsWith('sent_stocks:') ||
          key.includes(':202')) { // 删除所有包含年份的 key
        await redis.del(key);
        console.log(`Deleted: ${key}`);
      }
    }
    
    console.log('Step 1 completed: All cache cleared');
    
    // 3. 重新获取股票数据
    console.log('Step 2: Fetching fresh stock data...');
    const reports = await fetchEarningsReports();
    console.log(`Fetched ${reports.length} stock reports`);
    
    if (reports.length === 0) {
      console.error('No reports returned from fetchEarningsReports');
      return NextResponse.json({
        success: false,
        error: 'No stock data fetched from API. Please check API connection or try again later.'
      }, { status: 500 });
    }
    
    console.log('Sample report:', JSON.stringify(reports[0], null, 2));
    
    // 4. 按股票代码分组
    const stocksMap = new Map<string, any>();
    reports.forEach(report => {
      if (!stocksMap.has(report.stockCode)) {
        stocksMap.set(report.stockCode, {
          stockCode: report.stockCode,
          stockName: report.stockName,
          reports: []
        });
      }
      stocksMap.get(report.stockCode)!.reports.push(report);
    });
    
    const stocks = Array.from(stocksMap.values());
    console.log(`Organized into ${stocks.length} unique stocks`);
    
    // 5. 存储到 all_stocks_history
    await redis.set('all_stocks_history', JSON.stringify({
      data: stocks,
      timestamp: Date.now(),
      lastUpdate: new Date().toISOString()
    }));
    console.log('Step 2 completed: Stock data stored');
    
    // 6. 生成 AI 评分（如果配置了 API Key）
    let aiCommentsGenerated = 0;
    if (process.env.QWEN_API_KEY) {
      console.log('Step 3: Generating AI comments...');
      
      const aiComments: Record<string, string> = {};
      
      // 限制并发数量，避免 API 限流
      const batchSize = 5;
      for (let i = 0; i < stocks.length; i += batchSize) {
        const batch = stocks.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (stock) => {
          const report = stock.reports[0];
          try {
            const announcement = `${stock.stockName}（${stock.stockCode}）发布业绩预告：${report.forecastType}，业绩变动幅度为${report.changeMin}%~${report.changeMax}%，报告期为${report.quarter}。`;
            const prompt = `这是一家上市公司的消息：${announcement}\n\n请判断该消息本身对这个公司的股价有什么影响，用-100到100分来打分，打分权重是对公司营收和利润大幅持续提高的确定性越有利分数越高；如果该公告不是关于公司业绩而是对公司股价有直接影响的请用SABCD来打分（S为超高评价，D为最低评价）。（不显示思考过程，输出简要分析总结，将评分结果写在前）`;
            
            const response = await axios.post(
              'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
              {
                model: 'qwen-turbo',
                input: {
                  messages: [{ role: 'user', content: prompt }]
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
            const key = `${stock.stockCode}_${report.quarter}`;
            aiComments[key] = comment;
            await saveAiComment(stock.stockCode, report.quarter, comment);
            aiCommentsGenerated++;
            console.log(`AI comment generated for ${stock.stockCode} (${aiCommentsGenerated}/${stocks.length})`);
          } catch (error: any) {
            console.error(`Failed to generate AI comment for ${stock.stockCode}:`, error.message);
          }
        }));
        
        // 批次之间延迟，避免 API 限流
        if (i + batchSize < stocks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`Step 3 completed: Generated ${aiCommentsGenerated} AI comments`);
    } else {
      console.log('Step 3 skipped: QWEN_API_KEY not configured');
    }
    
    console.log('=== Reinitialization completed successfully ===');
    
    return NextResponse.json({
      success: true,
      message: '项目已完全重新初始化',
      stats: {
        stocksCount: stocks.length,
        reportsCount: reports.length,
        aiCommentsGenerated: aiCommentsGenerated,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Reinitialization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reinitialize',
      details: error.message
    }, { status: 500 });
  }
}
