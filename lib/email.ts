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
  const smtpUser = process.env.SMTP_USER || '';
  const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
  
  return {
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: smtpUser,
      pass: process.env.SMTP_PASS || '',
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
    
    if (!config.auth.user || !config.auth.pass) {
      console.error('Email configuration is missing');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    const info = await transporter.sendMail({
      from: config.from,
      to: to.join(', '),
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
