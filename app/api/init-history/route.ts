import { NextResponse } from 'next/server';
import { fetchEarningsReports } from '@/lib/eastmoney';
import { saveAllStocks } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * 初始化历史数据到数据库
 * 手动调用此API来将所有历史业绩预告数据存储到Upstash（永久存储）
 */
export async function POST() {
  try {
    console.log('Starting to initialize historical earnings data...');
    
    // 1. 获取所有业绩预增数据（不做日期过滤）
    const reports = await fetchEarningsReports();
    console.log(`Fetched ${reports.length} earnings reports`);
    
    if (reports.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No earnings reports found' 
      });
    }

    // 2. 按股票代码分组
    const stockMap = new Map<string, typeof reports>();
    reports.forEach(report => {
      const existing = stockMap.get(report.stockCode);
      if (existing) {
        existing.push(report);
      } else {
        stockMap.set(report.stockCode, [report]);
      }
    });

    // 3. 转换为存储格式
    const stocks = Array.from(stockMap.entries()).map(([code, stockReports]) => ({
      stockCode: code,
      stockName: stockReports[0].stockName,
      reports: stockReports.map(r => ({
        quarter: r.quarter,
        forecastType: r.forecastType,
        changeMin: r.changeMin,
        changeMax: r.changeMax,
        reportDate: r.reportDate,
        content: r.content
      }))
    }));

    // 4. 永久存储到数据库
    await saveAllStocks(stocks);
    console.log(`Successfully saved ${stocks.length} stocks with ${reports.length} total reports to permanent storage`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully initialized ${stocks.length} stocks with ${reports.length} reports`,
      stockCount: stocks.length,
      reportCount: reports.length
    });

  } catch (error) {
    console.error('Failed to initialize historical data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize data', details: String(error) },
      { status: 500 }
    );
  }
}
