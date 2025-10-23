import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export function getEmailConfig(): EmailConfig {
  // 优先使用环境变量，如果没有则使用默认值
  const smtpUser = process.env.SMTP_USER || '15010606939@sohu.com';
  const smtpHost = process.env.SMTP_HOST || 'smtp.sohu.com';
  const smtpPass = process.env.SMTP_PASS || 'EKBO8JUIQRNFY';
  
  return {
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    from: process.env.EMAIL_FROM || `业绩预增跟踪器 <${smtpUser}>`,
  };
}

export async function sendEmail(
  to: string[],
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    
    // 去重邮件列表，防止重复发送
    const uniqueRecipients = Array.from(new Set(to.map(email => email.trim()).filter(email => email)));
    
    console.log('Email config:', {
      host: config.host,
      port: config.port,
      user: config.auth.user,
      from: config.from,
      to: uniqueRecipients
    });
    
    if (uniqueRecipients.length === 0) {
      console.error('No valid recipients');
      return false;
    }
    
    if (!config.auth.user || !config.auth.pass) {
      console.error('Email configuration is missing');
      return false;
    }

    // 创建 SMTP 传输器 - 参考 smtpmail 项目的配置
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // 465 端口使用 SSL,其他端口使用 STARTTLS
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      // 添加调试和超时设置
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      // TLS 配置
      tls: {
        rejectUnauthorized: false
      }
    });

    // 先验证连接
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    console.log(`Sending email to ${uniqueRecipients.length} unique recipients...`);
    const info = await transporter.sendMail({
      from: config.from,
      to: uniqueRecipients.join(', '),
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`✅ Sent to: ${uniqueRecipients.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send email:');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error command:', error?.command);
    console.error('Full error:', error);
    return false;
  }
}
