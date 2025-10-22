import { NextRequest, NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports, formatEmailContent } from '@/lib/eastmoney';
import { getEmailList, isStockSent, markStockAsSent, addEmailHistory } from '@/lib/storage';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron Job - 每半小时执行一次
export async function GET(request: NextRequest) {
  // 验证 Cron Secret（可选，增加安全性）
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting earnings check...');
    
    // 1. 获取业绩预增数据
    const reports = await fetchEarningsReports();
    console.log(`Fetched ${reports.length} earnings reports`);
    
    if (reports.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No earnings reports found' 
      });
    }

    // 2. 获取最新的业绩预增股票
    const latestStocks = getLatestReports(reports);
    console.log(`Found ${latestStocks.size} stocks with latest earnings forecast`);
    
    if (latestStocks.size === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No earnings forecast stocks found' 
      });
    }

    // 3. 过滤掉已发送的股票
    const newStocks = new Map();
    for (const [code, stockReports] of latestStocks.entries()) {
      const latestQuarter = stockReports[0].quarter;
      const alreadySent = await isStockSent(code, latestQuarter);
      
      if (!alreadySent) {
        newStocks.set(code, stockReports);
      }
    }

    console.log(`${newStocks.size} new stocks to notify`);

    if (newStocks.size === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No new stocks to notify' 
      });
    }

    // 4. 获取邮件列表
    const emailList = await getEmailList();
    
    if (emailList.length === 0) {
      console.log('No email subscribers');
      return NextResponse.json({ 
        success: true, 
        message: 'No email subscribers' 
      });
    }

    // 5. 发送邮件
    const emailContent = formatEmailContent(newStocks);
    const subject = `业绩预增提醒：发现 ${newStocks.size} 只股票发布业绩预增公告`;
    
    const sent = await sendEmail(emailList, subject, emailContent);

    if (sent) {
      // 6. 标记为已发送
      for (const [code, stockReports] of newStocks.entries()) {
        await markStockAsSent(code, stockReports[0].quarter);
      }

      // 7. 记录发送历史
      const stocksArray = Array.from(newStocks.entries()).map(([code, reports]) => ({
        stockCode: code,
        stockName: reports[0].stockName,
        quarter: reports[0].quarter,
        forecastType: reports[0].forecastType,
        changeRange: `${reports[0].changeMin}%~${reports[0].changeMax}%`
      }));

      await addEmailHistory({
        sentAt: new Date().toISOString(),
        recipients: emailList,
        stockCount: newStocks.size,
        stocks: stocksArray
      });

      return NextResponse.json({ 
        success: true, 
        message: `Sent notifications for ${newStocks.size} stocks to ${emailList.length} subscribers`,
        stockCount: newStocks.size,
        emailCount: emailList.length
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}
