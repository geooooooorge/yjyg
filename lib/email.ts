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
  const smtpUser = process.env.SMTP_USER || '1445173369@qq.com';
  const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
  const smtpPass = process.env.SMTP_PASS || 'qbtuooluvcjtfhfh';
  
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
    
    console.log('Email config:', {
      host: config.host,
      port: config.port,
      user: config.auth.user,
      from: config.from,
      to: to
    });
    
    if (!config.auth.user || !config.auth.pass) {
      console.error('Email configuration is missing');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      // QQ邮箱特殊配置
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: config.from,
      to: to.join(', '),
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('Failed to send email:');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);
    return false;
  }
}
