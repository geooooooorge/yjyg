import { NextRequest, NextResponse } from 'next/server';
import { getEmailList, getTodayNewStocks, addEmailHistory } from '@/lib/storage';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 格式化每日汇总邮件内容
function formatDailySummaryEmail(stocks: any[]): string {
  if (stocks.length === 0) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          📊 每日业绩预增汇总
        </h2>
        <p style="color: #666; font-size: 14px;">
          ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; text-align: center;">今日暂无新增业绩预增公告</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          此邮件由业绩预增跟踪系统自动发送，每日08:00定时推送
        </p>
      </div>
    `;
  }

  // 按季度分组
  const groupedByQuarter = stocks.reduce((acc, stock) => {
    const quarter = stock.reports[0].quarter;
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    acc[quarter].push(stock);
    return acc;
  }, {} as Record<string, typeof stocks>);

  // 按季度排序（从新到旧）
  const sortedQuarters = Object.keys(groupedByQuarter).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // 格式化季度显示
  const formatQuarter = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parts[0];
    const month = parseInt(parts[1]);
    
    let quarter = 1;
    if (month === 3) quarter = 1;
    else if (month === 6) quarter = 2;
    else if (month === 9) quarter = 3;
    else if (month === 12) quarter = 4;
    
    return `${year}年${quarter}季度`;
  };

  let stocksHtml = '';
  sortedQuarters.forEach(quarter => {
    const quarterStocks = groupedByQuarter[quarter];
    stocksHtml += `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #4f46e5; font-size: 16px; margin-bottom: 15px;">
          ${formatQuarter(quarter)}业绩预增 (${quarterStocks.length}只)
        </h3>
    `;
    
    quarterStocks.forEach(stock => {
      const report = stock.reports[0];
      const announcementUrl = `http://data.eastmoney.com/notices/detail/${stock.stockCode}/.html`;
      
      stocksHtml += `
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <strong style="color: #1f2937; font-size: 16px;">${stock.stockName}</strong>
              <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">${stock.stockCode}</span>
            </div>
            <span style="color: #10b981; font-weight: bold; font-size: 14px;">
              ${report.forecastType} ${report.changeMin}%~${report.changeMax}%
            </span>
          </div>
          <div style="color: #6b7280; font-size: 12px; display: flex; justify-content: space-between;">
            <span>公告日期：${report.reportDate}</span>
            <a href="${announcementUrl}" style="color: #4f46e5; text-decoration: none;">查看公告 →</a>
          </div>
        </div>
      `;
    });
    
    stocksHtml += '</div>';
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        📊 每日业绩预增汇总
      </h2>
      <p style="color: #666; font-size: 14px;">
        ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #1e40af; margin: 0; font-size: 14px;">
          ✨ 今日共发现 <strong>${stocks.length}</strong> 只股票发布业绩预增公告
        </p>
      </div>
      ${stocksHtml}
      <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        此邮件由业绩预增跟踪系统自动发送，每日08:00定时推送过去24小时的公告信息
      </p>
    </div>
  `;
}

// Vercel Cron Job - 每日08:00触发，发送过去24小时的公告汇总
export async function GET(request: NextRequest) {
  // 验证 Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Daily summary cron triggered at 08:00...');
    
    // 1. 获取今日新增的股票
    const todayStocks = await getTodayNewStocks();
    const stocks = todayStocks || [];
    console.log(`Found ${stocks.length} stocks from today`);

    // 2. 获取邮件列表
    const emailList = await getEmailList();
    
    if (emailList.length === 0) {
      console.log('No email subscribers');
      return NextResponse.json({ 
        success: true, 
        message: 'No email subscribers',
        stockCount: stocks.length
      });
    }

    // 3. 发送每日汇总邮件
    const emailContent = formatDailySummaryEmail(stocks);
    const subject = stocks.length > 0 
      ? `📊 每日汇总：今日共 ${stocks.length} 只股票发布业绩预增公告`
      : `📊 每日汇总：今日暂无新增业绩预增公告`;
    
    const sent = await sendEmail(emailList, subject, emailContent);

    if (sent) {
      // 4. 记录发送历史
      if (stocks.length > 0) {
        const stocksArray = stocks.map(stock => ({
          stockCode: stock.stockCode,
          stockName: stock.stockName,
          quarter: stock.reports[0].quarter,
          forecastType: stock.reports[0].forecastType,
          changeRange: `${stock.reports[0].changeMin}%~${stock.reports[0].changeMax}%`
        }));

        await addEmailHistory({
          sentAt: new Date().toISOString(),
          recipients: emailList,
          stockCount: stocks.length,
          stocks: stocksArray
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Daily summary sent to ${emailList.length} subscribers`,
        stockCount: stocks.length,
        emailCount: emailList.length
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send daily summary email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Daily summary cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Daily summary cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}
