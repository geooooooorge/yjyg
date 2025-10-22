import { NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports } from '@/lib/eastmoney';
import { getCachedStocks, cacheStocks } from '@/lib/storage';

// GET - 获取最新业绩预增数据
export async function GET() {
  try {
    // 先尝试从缓存获取
    const cached = await getCachedStocks();
    if (cached) {
      console.log('Returning cached stocks data');
      return NextResponse.json({ 
        success: true, 
        count: cached.length,
        stocks: cached,
        cached: true
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
      cached: false
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
