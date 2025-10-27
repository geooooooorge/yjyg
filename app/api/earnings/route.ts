import { NextRequest, NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports } from '@/lib/eastmoney';
import { getCachedStocks, cacheStocks, getTodayNewStocks, getAllStocks } from '@/lib/storage';

// GET - 获取业绩预增数据
// 查询参数: 
//   - type=today (今日新增)
//   - type=recent (近7天数据)
//   - type=all (全部历史数据，默认)
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

    // 如果请求近7天数据
    if (type === 'recent') {
      // 先尝试从缓存获取（最近7天）
      const cached = await getCachedStocks();
      if (cached) {
        console.log('Returning cached recent stocks (7 days):', cached.length);
        return NextResponse.json({ 
          success: true, 
          count: cached.length,
          stocks: cached,
          source: 'cache',
          type: 'recent'
        });
      }

      // 缓存没有，从API获取最近7天数据
      console.log('Fetching fresh recent stocks (7 days)');
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
        source: 'api',
        type: 'recent'
      });
    }

    // 请求全部历史数据
    // 先尝试从永久存储获取
    const allStocks = await getAllStocks();
    if (allStocks && allStocks.length > 0) {
      console.log('Returning all stocks from permanent storage:', allStocks.length);
      return NextResponse.json({ 
        success: true, 
        count: allStocks.length,
        stocks: allStocks,
        source: 'permanent_storage',
        type: 'all'
      });
    }

    // 永久存储没有数据，尝试从缓存获取（最近7天）
    const cached = await getCachedStocks();
    if (cached) {
      console.log('Returning cached stocks data (recent 7 days)');
      return NextResponse.json({ 
        success: true, 
        count: cached.length,
        stocks: cached,
        source: 'cache',
        type: 'all'
      });
    }

    // 缓存也没有，从API获取最近7天数据
    console.log('Fetching fresh stocks data (recent 7 days)');
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
      source: 'api',
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
