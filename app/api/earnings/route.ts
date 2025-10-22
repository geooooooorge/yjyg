import { NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports } from '@/lib/eastmoney';

// GET - 获取最新业绩预增数据
export async function GET() {
  try {
    const reports = await fetchEarningsReports();
    const latestStocks = getLatestReports(reports);
    
    const result = Array.from(latestStocks.entries()).map(([code, reports]) => ({
      stockCode: code,
      stockName: reports[0].stockName,
      reports: reports,
    }));

    return NextResponse.json({ 
      success: true, 
      count: result.length,
      stocks: result 
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
