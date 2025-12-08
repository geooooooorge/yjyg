import { NextRequest, NextResponse } from 'next/server';
import { getTodayNewStocks, getCachedStocks, getAllAiComments } from '@/lib/storage';

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
    // 1. 获取股票数据（优先今日新增，否则近7天）
    let stocks = await getTodayNewStocks();
    let stocksType = 'today';
    
    if (!stocks || stocks.length === 0) {
      stocks = await getCachedStocks();
      stocksType = 'recent';
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
