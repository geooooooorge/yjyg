# 重复邮件问题修复说明

## 问题描述
系统在定时发送和测试邮件时，会向同一个邮箱发送2封重复的邮件。

## 根本原因
1. **邮件列表可能包含重复项**：用户可能手动添加了默认邮箱(15010606939@163.com)，导致列表中存在重复
2. **缺少去重机制**：在获取邮件列表和发送邮件时都没有去重检查

## 修复方案

### 1. 存储层去重 (lib/storage.ts)
在 `getEmailList()` 函数中使用 `Set` 自动去重：

```typescript
export async function getEmailList(): Promise<string[]> {
  const list = await getRawEmailList();
  
  // 使用 Set 去重，确保默认邮箱在最前面
  const uniqueEmails = new Set<string>();
  uniqueEmails.add('15010606939@163.com'); // 默认邮箱始终在第一位
  
  // 添加其他邮箱
  list.forEach(email => {
    if (email && email.trim()) {
      uniqueEmails.add(email.trim());
    }
  });
  
  const result = Array.from(uniqueEmails);
  console.log('getEmailList result:', result);
  return result;
}
```

**优点**：
- 使用 `Set` 数据结构自动去重
- 默认邮箱始终在第一位
- 过滤空字符串和空白字符
- 添加日志便于调试

### 2. 发送层去重 (lib/email.ts)
在 `sendEmail()` 函数中发送前再次去重：

```typescript
export async function sendEmail(
  to: string[],
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    
    // 去重邮件列表，防止重复发送
    const uniqueRecipients = Array.from(
      new Set(to.map(email => email.trim()).filter(email => email))
    );
    
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
    
    // ... 发送邮件
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
    // ... 错误处理
  }
}
```

**优点**：
- 双重保险，即使存储层有问题也能防止重复
- 去除邮箱地址的空白字符
- 过滤空邮箱
- 详细的日志记录实际发送情况

## 影响范围
修复后，以下功能都不会再发送重复邮件：
- ✅ 定时任务邮件通知 (`/api/cron/check-earnings`)
- ✅ 测试邮件 (`/api/test-email`)
- ✅ 所有使用 `sendEmail()` 函数的地方

## 测试验证
1. 查看邮件列表是否有重复项
2. 发送测试邮件，确认只收到1封
3. 等待定时任务触发，确认只收到1封通知邮件
4. 检查日志，确认显示正确的收件人数量

## 部署信息
- **提交**: c98381c
- **提交信息**: Fix duplicate email sending: deduplicate recipients in both storage and email functions
- **部署**: Vercel 自动部署
- **修复时间**: 2025-10-23

## 注意事项
- 默认邮箱 (15010606939@163.com) 始终会在列表中
- 即使用户手动添加默认邮箱，也只会显示一次
- 所有邮箱地址会自动去除首尾空白字符
