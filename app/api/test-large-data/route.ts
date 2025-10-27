import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const ALL_STOCKS_KEY = 'all_stocks_history';

/**
 * 测试大数据存储和读取
 */
export async function GET() {
  try {
    // 1. 直接读取 all_stocks_history key
    console.log('Reading from ALL_STOCKS_KEY:', ALL_STOCKS_KEY);
    const stored = await getValue<{ data: any[], updatedAt: string, count: number }>(ALL_STOCKS_KEY);
    
    if (!stored) {
      return NextResponse.json({
        success: false,
        message: 'No data found in ALL_STOCKS_KEY',
        key: ALL_STOCKS_KEY
      });
    }

    // 2. 计算数据大小
    const dataSize = JSON.stringify(stored).length;
    const dataSizeKB = (dataSize / 1024).toFixed(2);
    const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);

    return NextResponse.json({
      success: true,
      key: ALL_STOCKS_KEY,
      hasData: true,
      count: stored.count,
      updatedAt: stored.updatedAt,
      dataSize: `${dataSize} bytes (${dataSizeKB} KB, ${dataSizeMB} MB)`,
      sample: stored.data.slice(0, 2)
    });

  } catch (error) {
    console.error('Test large data error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
