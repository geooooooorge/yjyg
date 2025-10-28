import { NextRequest, NextResponse } from 'next/server';
import { getValue } from '@/lib/storage';
import { formatEmailContent } from '@/lib/eastmoney';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// 手动发送测试邮件 - 只发送给指定邮箱
export async function POST(request: NextRequest) {
  try {
    console.log('Manual test email triggered');
    
    // 1. 获取今日新增股票
    const todayStocks = await getValue<any[]>('today_new_stocks') || [];
    
    if (todayStocks.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '今日暂无新增股票，无法发送测试邮件' 
      });
    }

    // 2. 转换为 Map 格式（formatEmailContent 需要）
    const stocksMap = new Map();
    todayStocks.forEach(stock => {
      stocksMap.set(stock.stockCode, stock.reports);
    });

    // 3. 生成邮件内容
    const emailContent = formatEmailContent(stocksMap);
    const subject = `【测试】业绩预增提醒：发现 ${todayStocks.length} 只股票发布业绩预增公告`;
    
    // 4. 只发送给指定的测试邮箱
    const testEmail = '15010606939@163.com';
    
    console.log(`Sending test email to ${testEmail}...`);
    const sent = await sendEmail([testEmail], subject, emailContent);
    console.log('Test email send result:', sent);

    if (sent) {
      return NextResponse.json({ 
        success: true, 
        message: `测试邮件已发送到 ${testEmail}`,
        stockCount: todayStocks.length,
        recipient: testEmail
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '测试邮件发送失败，请检查邮件配置'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: '发送测试邮件失败', details: String(error) },
      { status: 500 }
    );
  }
}

// GET 方法用于查看今日新增股票（不发送邮件）
export async function GET() {
  try {
    const todayStocks = await getValue<any[]>('today_new_stocks') || [];
    
    return NextResponse.json({ 
      success: true, 
      stockCount: todayStocks.length,
      stocks: todayStocks,
      message: todayStocks.length > 0 
        ? `今日有 ${todayStocks.length} 只新增股票，可以发送测试邮件` 
        : '今日暂无新增股票'
    });
  } catch (error) {
    console.error('Get today stocks error:', error);
    return NextResponse.json(
      { success: false, error: '获取今日股票失败', details: String(error) },
      { status: 500 }
    );
  }
}
