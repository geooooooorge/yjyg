import { NextResponse } from 'next/server';
import { saveAllStocks, getAllStocks } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * 测试存储功能
 */
export async function GET() {
  try {
    // 测试数据
    const testData = [
      {
        stockCode: '000001',
        stockName: '平安银行',
        reports: [
          {
            quarter: '2024-09-30',
            forecastType: '预增',
            changeMin: 50,
            changeMax: 100,
            reportDate: '2024-10-20',
            content: '测试数据'
          }
        ]
      },
      {
        stockCode: '000002',
        stockName: '万科A',
        reports: [
          {
            quarter: '2024-09-30',
            forecastType: '预增',
            changeMin: 30,
            changeMax: 80,
            reportDate: '2024-10-21',
            content: '测试数据2'
          }
        ]
      }
    ];

    // 保存测试数据
    console.log('Saving test data...');
    await saveAllStocks(testData);
    console.log('Test data saved');

    // 读取数据
    console.log('Reading test data...');
    const retrieved = await getAllStocks();
    console.log('Retrieved data:', retrieved);

    return NextResponse.json({
      success: true,
      saved: testData.length,
      retrieved: retrieved ? retrieved.length : 0,
      data: retrieved
    });

  } catch (error) {
    console.error('Test storage error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
