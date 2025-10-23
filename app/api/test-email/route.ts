import { NextResponse } from 'next/server';
import { getEmailList } from '@/lib/storage';
import { sendEmail } from '@/lib/email';

// GET - 发送测试邮件
export async function GET() {
  try {
    console.log('Starting test email send...');
    
    // 1. 获取邮件列表
    const emailList = await getEmailList();
    console.log('Email list:', emailList);
    
    if (emailList.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有订阅邮箱' 
      });
    }

    // 2. 准备测试邮件内容（使用与即时通知相同的格式）
    const subject = '✅ 测试邮件 - 业绩预增跟踪系统';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">✅ 测试邮件</h2>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">邮件系统运行正常</p>
        </div>
        
        <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="color: #155724; margin: 0; font-size: 15px;">
            🎉 <strong>恭喜！邮件系统配置成功</strong>
          </p>
        </div>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">📊 系统信息</h3>
          <div style="color: #6b7280; font-size: 13px; line-height: 1.8;">
            <p style="margin: 5px 0;">📧 发件人：15010606939@sohu.com</p>
            <p style="margin: 5px 0;">⏰ 发送时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
            <p style="margin: 5px 0;">👥 订阅人数：${emailList.length} 人</p>
          </div>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">⚡ 即时通知</h3>
          <div style="color: #6b7280; font-size: 13px; line-height: 1.8;">
            <p style="margin: 5px 0;">• 每5分钟自动检查新公告</p>
            <p style="margin: 5px 0;">• 发现新增立即推送邮件</p>
            <p style="margin: 5px 0;">• 自动去重，避免重复通知</p>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">📅 每日汇总</h3>
          <div style="color: #6b7280; font-size: 13px; line-height: 1.8;">
            <p style="margin: 5px 0;">• 每天早上08:00定时推送</p>
            <p style="margin: 5px 0;">• 汇总过去24小时所有公告</p>
            <p style="margin: 5px 0;">• 无新增也会发送提醒</p>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.6;">
            💡 <strong>提示：</strong>如果您收到这封测试邮件，说明邮件系统已正常工作！系统将在发现新的业绩预增股票时自动通知您。
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
          <p style="margin: 5px 0;">📊 数据来源：东方财富</p>
          <p style="margin: 5px 0;">⏰ 测试时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
          <p style="margin: 5px 0; color: #d1d5db;">此邮件由业绩预增跟踪系统自动发送</p>
        </div>
      </div>
    `;

    // 3. 发送邮件
    console.log('Sending test email to:', emailList);
    const sent = await sendEmail(emailList, subject, html);

    if (sent) {
      return NextResponse.json({ 
        success: true, 
        message: `测试邮件已发送到 ${emailList.length} 个邮箱`,
        recipients: emailList
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '邮件发送失败，请检查SMTP配置' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: '发送失败', details: String(error) },
      { status: 500 }
    );
  }
}
