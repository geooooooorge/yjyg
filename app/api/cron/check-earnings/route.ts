import { NextRequest, NextResponse } from 'next/server';
import { fetchEarningsReports, getLatestReports, formatEmailContent } from '@/lib/eastmoney';
import { getEmailList, isStockSent, markStockAsSent, addEmailHistory, getValue, setValue, addTodayNewStocks } from '@/lib/storage';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron Job - 每5分钟触发，只在有新公告时发送邮件
export async function GET(request: NextRequest) {
  // 验证 Cron Secret（可选，增加安全性）
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Cron triggered, checking for new earnings reports...');
    
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
    console.log('=== Filtering already sent stocks ===');
    const newStocks = new Map();
    for (const [code, stockReports] of latestStocks.entries()) {
      const latestQuarter = stockReports[0].quarter;
      const stockName = stockReports[0].stockName;
      console.log(`Checking ${stockName} (${code}) for quarter ${latestQuarter}`);
      const alreadySent = await isStockSent(code, latestQuarter);
      
      if (!alreadySent) {
        console.log(`  -> Adding to new stocks list`);
        newStocks.set(code, stockReports);
      } else {
        console.log(`  -> Skipping (already sent)`);
      }
    }

    console.log(`=== Filter complete: ${newStocks.size} new stocks to notify ===`);

    if (newStocks.size === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No new stocks to notify' 
      });
    }

    // 4. 将新增股票保存到今日列表
    const newStocksArray = Array.from(newStocks.entries()).map(([code, reports]) => ({
      stockCode: code,
      stockName: reports[0].stockName,
      reports: reports,
    }));
    await addTodayNewStocks(newStocksArray);
    console.log(`Added ${newStocksArray.length} stocks to today's new list`);

    // 5. 获取邮件列表
    const emailList = await getEmailList();
    
    if (emailList.length === 0) {
      console.log('No email subscribers');
      return NextResponse.json({ 
        success: true, 
        message: 'No email subscribers, but stocks added to today list',
        stockCount: newStocks.size
      });
    }

    // 6. 发送邮件（只推送新增的公告内容）
    const emailContent = formatEmailContent(newStocks);
    const subject = `业绩预增提醒：发现 ${newStocks.size} 只股票发布业绩预增公告`;
    
    console.log('Attempting to send email...');
    const sent = await sendEmail(emailList, subject, emailContent);
    console.log('Email send result:', sent);

    // 7. 无论邮件是否发送成功，都标记为已发送（避免重复通知）
    console.log('Marking stocks as sent...');
    for (const [code, stockReports] of newStocks.entries()) {
      const quarter = stockReports[0].quarter;
      console.log(`Marking ${code} (${quarter}) as sent`);
      await markStockAsSent(code, quarter);
    }
    console.log('All stocks marked as sent');

    if (sent) {
      // 8. 记录发送历史
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
        error: 'Failed to send email, but stocks marked as sent to avoid duplicate notifications',
        stockCount: newStocks.size
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
