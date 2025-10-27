import { NextResponse } from 'next/server';
import { getAllStocks } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * 调试：检查永久存储中的数据
 */
export async function GET() {
  try {
    console.log('Checking permanent storage...');
    const allStocks = await getAllStocks();
    
    return NextResponse.json({
      success: true,
      hasData: allStocks !== null,
      count: allStocks ? allStocks.length : 0,
      sample: allStocks ? allStocks.slice(0, 3) : null,
      message: allStocks 
        ? `Found ${allStocks.length} stocks in permanent storage` 
        : 'No data in permanent storage'
    });

  } catch (error) {
    console.error('Debug storage error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
