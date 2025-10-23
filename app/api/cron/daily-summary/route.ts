import { NextRequest, NextResponse } from 'next/server';
import { getEmailList, getTodayNewStocks, addEmailHistory } from '@/lib/storage';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 格式化每日汇总邮件内容
function formatDailySummaryEmail(stocks: any[]): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  if (stocks.length === 0) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">📊 每日业绩预增汇总</h2>
          <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 14px;">${dateStr}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">💤</div>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">今日暂无新增业绩预增公告</p>
          <p style="color: #9ca3af; font-size: 14px; margin: 10px 0 0 0;">请继续关注，我们会在有新公告时立即通知您</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
          <p style="margin: 5px 0;">📊 数据来源：东方财富</p>
          <p style="margin: 5px 0;">⏰ 推送时间：每日 08:00</p>
          <p style="margin: 5px 0; color: #d1d5db;">此邮件由业绩预增跟踪系统自动发送</p>
        </div>
      </div>
    `;
  }

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
    
    return `${year}年Q${quarter}`;
  };

  let stocksHtml = '';
  stocks.forEach(stock => {
    const report = stock.reports[0];
    const announcementUrl = `http://data.eastmoney.com/notices/detail/${stock.stockCode}/.html`;
    
    stocksHtml += `
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <strong style="color: #1f2937; font-size: 18px;">${stock.stockName}</strong>
            <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">${stock.stockCode}</span>
          </div>
          <span style="color: #10b981; font-weight: bold; font-size: 16px;">
            ${report.forecastType} ${report.changeMin}%~${report.changeMax}%
          </span>
        </div>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
          <span>📅 报告期：${formatQuarter(report.quarter)}</span>
          <span style="margin-left: 20px;">📢 公告日期：${report.reportDate}</span>
        </div>
        <div style="margin-top: 10px;">
          <a href="${announcementUrl}" style="color: #4f46e5; text-decoration: none; font-size: 13px;">📄 查看完整公告 →</a>
        </div>
      </div>
    `;
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">📊 每日业绩预增汇总</h2>
        <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 14px;">${dateStr}</p>
      </div>
      
      <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <p style="color: #1e40af; margin: 0; font-size: 15px;">
          ✨ <strong>昨日共发现 ${stocks.length} 只股票发布业绩预增公告</strong>
        </p>
      </div>
      
      ${stocksHtml}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
        <p style="margin: 5px 0;">📊 数据来源：东方财富</p>
        <p style="margin: 5px 0;">⏰ 推送时间：每日 08:00</p>
        <p style="margin: 5px 0; color: #d1d5db;">此邮件由业绩预增跟踪系统自动发送</p>
      </div>
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
