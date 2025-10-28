import { NextResponse } from 'next/server';
import { setValue } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// 清空缓存数据，强制重新获取
export async function POST() {
  try {
    // 清空相关缓存
    await setValue('today_new_stocks', null);
    await setValue('stocks_cache', null);
    await setValue('sent_stocks', {});
    
    return NextResponse.json({ 
      success: true, 
      message: '缓存已清空，请刷新页面重新获取数据'
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to refresh data'
    }, { status: 500 });
  }
}
