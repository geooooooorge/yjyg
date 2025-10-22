# 163邮箱配置说明

## 发件人邮箱
- 邮箱地址: **15010606939@163.com**
- SMTP服务器: smtp.163.com
- 端口: 465 (SSL)

## 环境变量配置

### 本地开发 (.env.local)
在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
# 163邮箱SMTP配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=15010606939@163.com
SMTP_PASS=你的授权码

# 发件人显示名称
EMAIL_FROM=业绩预增跟踪器 <15010606939@163.com>

# Vercel KV配置（部署时需要）
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token

# Cron任务密钥（可选）
CRON_SECRET=your-secret-key
```

### Vercel部署配置
在Vercel项目设置中添加环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：
   - `SMTP_HOST` = `smtp.163.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `15010606939@163.com`
   - `SMTP_PASS` = `你的授权码`
   - `EMAIL_FROM` = `业绩预增跟踪器 <15010606939@163.com>`

## 获取163邮箱授权码

### 步骤：
1. 登录163邮箱 (mail.163.com)
2. 点击右上角"设置" → "POP3/SMTP/IMAP"
3. 开启"SMTP服务"
4. 点击"授权密码管理"
5. 新增授权密码
6. 按照提示发送短信验证
7. 获得授权码（16位字符）

**重要**: 
- 授权码不是邮箱登录密码
- 授权码用于第三方客户端登录
- 请妥善保管授权码

## 测试邮件发送

### 本地测试
```bash
# 确保.env.local配置正确
npm run dev

# 访问管理页面添加测试邮箱
# 等待Cron任务执行（每30分钟）
# 或手动触发：访问 http://localhost:3000/api/cron/check-earnings
```

### 生产环境测试
部署到Vercel后，系统会自动每30分钟检查一次业绩预增数据并发送邮件。

## 常见问题

### 1. 发送失败：535 Error
- 原因：授权码错误或未开启SMTP服务
- 解决：重新获取授权码，确保SMTP服务已开启

### 2. 发送失败：Connection timeout
- 原因：网络问题或端口被封
- 解决：检查防火墙设置，确认端口465可用

### 3. 邮件进入垃圾箱
- 原因：发件人信誉度低
- 解决：
  - 让收件人将邮箱加入白名单
  - 避免频繁发送
  - 优化邮件内容

## 默认配置

如果不设置环境变量，系统使用以下默认值：
- SMTP服务器: smtp.163.com
- 端口: 465
- 发件人: 15010606939@163.com
- **注意**: 必须设置SMTP_PASS（授权码）才能发送邮件

## 安全提醒

⚠️ **不要将授权码提交到Git仓库**
- .env.local 已在 .gitignore 中
- 只在Vercel环境变量中配置
- 定期更换授权码
