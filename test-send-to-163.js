const nodemailer = require('nodemailer');

console.log('=== 发送测试邮件到 15010606939@163.com ===\n');

const user = '15010606939@sohu.com';
const pass = 'EKBO8JUIQRNFY';

const config = {
  host: 'smtp.sohu.com',
  port: 465,
  secure: true,
  auth: {
    user: user,
    pass: pass
  }
};

console.log('配置信息:');
console.log('- 发件人:', user);
console.log('- 收件人: 15010606939@163.com');
console.log('- 服务器:', config.host);
console.log('');

async function sendTestEmail() {
  try {
    console.log('创建传输器...');
    const transporter = nodemailer.createTransport({
      ...config,
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('验证SMTP连接...');
    await transporter.verify();
    console.log('✅ SMTP连接成功！\n');

    console.log('发送测试邮件...');
    const info = await transporter.sendMail({
      from: '业绩预增跟踪器 <15010606939@sohu.com>',
      to: '15010606939@163.com',
      subject: '测试邮件 - ' + new Date().toLocaleString('zh-CN'),
      html: `
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
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #667eea; }
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
                <strong>✅ 邮件系统测试成功！</strong>
              </div>
              
              <h2>邮件信息</h2>
              <ul>
                <li><strong>发件人：</strong>15010606939@sohu.com</li>
                <li><strong>收件人：</strong>15010606939@163.com</li>
                <li><strong>发送时间：</strong>${new Date().toLocaleString('zh-CN')}</li>
              </ul>

              <p>如果你收到这封邮件，说明从搜狐邮箱发送到163邮箱是成功的！</p>

              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                这是一封自动发送的测试邮件<br>
                业绩预增跟踪器 © 2025
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ 邮件发送成功！');
    console.log('Message ID:', info.messageId);
    console.log('\n请检查邮箱 15010606939@163.com 的收件箱（可能在垃圾箱）');

  } catch (error) {
    console.error('\n❌ 错误:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误命令:', error.command);
    console.error('\n完整错误:');
    console.error(error);
  }
}

sendTestEmail();
