import { NextRequest, NextResponse } from 'next/server';
import { getStockPriceChange } from '@/lib/eastmoney';

// GET - 获取股票涨跌幅
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stockCode = searchParams.get('code');
    const reportDate = searchParams.get('date');

    if (!stockCode || !reportDate) {
      return NextResponse.json(
        { success: false, error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const priceData = await getStockPriceChange(stockCode, reportDate);

    if (!priceData) {
      return NextResponse.json({ 
        success: false, 
        priceChange: 0,
        currentPrice: 0
      });
    }

    return NextResponse.json({ 
      success: true,
      ...priceData
    });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock price' },
      { status: 500 }
    );
  }
}
