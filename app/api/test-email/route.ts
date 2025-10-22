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

    // 2. 准备测试邮件内容
    const subject = '业绩预增跟踪器 - 测试邮件';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { color: #667eea; margin-top: 0; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 测试邮件</h1>
            <p>业绩预增跟踪器</p>
          </div>
          <div class="content">
            <div class="success">
              <strong>✅ 邮件系统正常运行！</strong>
            </div>
            
            <h2>系统信息</h2>
            <ul>
              <li><strong>发件人：</strong>1445173369@qq.com</li>
              <li><strong>发送时间：</strong>${new Date().toLocaleString('zh-CN')}</li>
              <li><strong>订阅人数：</strong>${emailList.length} 人</li>
            </ul>

            <div class="info">
              <h3>📊 功能说明</h3>
              <p>本系统会自动监控A股业绩预增公告，每30分钟检查一次，发现新的业绩预增股票时会自动发送邮件通知。</p>
            </div>

            <h2>监控范围</h2>
            <ul>
              <li>业绩预增公告</li>
              <li>预增幅度 > 30%</li>
              <li>自动去重，避免重复通知</li>
            </ul>

            <h2>下一步</h2>
            <p>如果您收到这封测试邮件，说明邮件系统配置成功！系统将在发现新的业绩预增股票时自动通知您。</p>

            <div class="footer">
              <p>这是一封自动发送的测试邮件</p>
              <p>业绩预增跟踪器 © 2025</p>
            </div>
          </div>
        </div>
      </body>
      </html>
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
