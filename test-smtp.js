const nodemailer = require('nodemailer');

console.log('=== 测试QQ邮箱SMTP连接 ===\n');

const user = '1445173369@qq.com';
const pass = 'qbtuooluvcjtfhfh';

const config = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: user,
    pass: pass
  }
};

console.log('配置信息:');
console.log('- 服务器:', config.host);
console.log('- 端口:', config.port);
console.log('- 用户:', user);
console.log('- 授权码:', pass.substring(0, 4) + '****');
console.log('');

async function testSMTP() {
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
      from: '业绩预增跟踪器 <1445173369@qq.com>',
      to: '1445173369@qq.com',
      subject: '测试邮件 - ' + new Date().toLocaleString(),
      html: '<h1>测试成功！</h1><p>如果你收到这封邮件，说明SMTP配置正确。</p>'
    });

    console.log('✅ 邮件发送成功！');
    console.log('Message ID:', info.messageId);
    console.log('\n请检查邮箱 1445173369@qq.com 的收件箱（可能在垃圾箱）');

  } catch (error) {
    console.error('\n❌ 错误:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误命令:', error.command);
    console.error('\n完整错误:');
    console.error(error);
    
    console.log('\n可能的原因:');
    if (error.code === 'EAUTH') {
      console.log('- 授权码错误或已过期');
      console.log('- SMTP服务未开启');
      console.log('- 请重新生成授权码');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('- 网络连接问题');
      console.log('- 防火墙阻止');
      console.log('- 端口被封');
    } else {
      console.log('- 请检查QQ邮箱设置');
      console.log('- 确认SMTP服务已开启');
    }
  }
}

testSMTP();
