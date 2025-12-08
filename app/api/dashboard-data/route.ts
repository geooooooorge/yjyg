import { NextRequest, NextResponse } from 'next/server';
import { getTodayNewStocks, getCachedStocks, getAllAiComments, getAllStocks, cacheStocks } from '@/lib/storage';
import { fetchEarningsReports, getLatestReports } from '@/lib/eastmoney';

export const dynamic = 'force-dynamic';

/**
 * 获取页面前端显示的核心信息
 * GET /api/dashboard-data
 * 
 * 返回数据包括：
 * - stocks: 股票数据（今日新增或近7天）
 * - aiComments: AI 评论数据
 * - timestamp: 数据时间戳
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 获取股票数据（优先今日新增，否则近7天，最后尝试历史数据）
    let stocks = await getTodayNewStocks();
    let stocksType = 'today';
    
    if (!stocks || stocks.length === 0) {
      // 尝试获取缓存的近7天数据
      stocks = await getCachedStocks();
      stocksType = 'recent';
      
      if (!stocks || stocks.length === 0) {
        // 缓存过期，尝试从永久存储获取历史数据
        stocks = await getAllStocks();
        stocksType = 'history';
        
        if (!stocks || stocks.length === 0) {
          // 永久存储也没有，从 API 获取最近7天数据
          console.log('No cached data, fetching from API...');
          const reports = await fetchEarningsReports();
          const latestStocks = getLatestReports(reports);
          
          stocks = Array.from(latestStocks.entries()).map(([code, reports]) => ({
            stockCode: code,
            stockName: reports[0].stockName,
            reports: reports,
          }));
          
          // 缓存结果
          if (stocks.length > 0) {
            await cacheStocks(stocks);
          }
          stocksType = 'api';
        }
      }
    }

    // 2. 获取 AI 评论
    const aiComments = await getAllAiComments();

    // 3. 构建响应数据
    const dashboardData = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        stocks: {
          type: stocksType,
          count: stocks?.length || 0,
          list: stocks || []
        },
        aiComments: aiComments || {}
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
