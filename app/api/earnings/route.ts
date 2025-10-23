import { NextRequest, NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports } from '@/lib/eastmoney';
import { getCachedStocks, cacheStocks, getTodayNewStocks } from '@/lib/storage';

// GET - 获取业绩预增数据
// 查询参数: type=today (今日新增) 或 type=all (全部，默认)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    // 如果请求今日新增
    if (type === 'today') {
      const todayStocks = await getTodayNewStocks();
      if (todayStocks) {
        console.log('Returning today new stocks:', todayStocks.length);
        return NextResponse.json({ 
          success: true, 
          count: todayStocks.length,
          stocks: todayStocks,
          type: 'today'
        });
      } else {
        // 今日暂无新增
        return NextResponse.json({ 
          success: true, 
          count: 0,
          stocks: [],
          type: 'today'
        });
      }
    }

    // 请求全部数据
    // 先尝试从缓存获取
    const cached = await getCachedStocks();
    if (cached) {
      console.log('Returning cached stocks data');
      return NextResponse.json({ 
        success: true, 
        count: cached.length,
        stocks: cached,
        cached: true,
        type: 'all'
      });
    }

    // 缓存未命中，从API获取
    console.log('Fetching fresh stocks data');
    const reports = await fetchEarningsReports();
    const latestStocks = getLatestReports(reports);
    
    const result = Array.from(latestStocks.entries()).map(([code, reports]) => ({
      stockCode: code,
      stockName: reports[0].stockName,
      reports: reports,
    }));

    // 缓存结果
    await cacheStocks(result);

    return NextResponse.json({ 
      success: true, 
      count: result.length,
      stocks: result,
      cached: false,
      type: 'all'
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
