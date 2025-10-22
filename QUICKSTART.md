# 快速开始指南

## 5分钟快速部署

### 1️⃣ 配置邮箱（2分钟）

**使用QQ邮箱（推荐）：**

1. 打开 https://mail.qq.com
2. 设置 → 账户 → 开启IMAP/SMTP服务
3. 生成授权码（记住这个16位密码）

### 2️⃣ 创建 .env.local 文件（1分钟）

在项目根目录创建 `.env.local` 文件：

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=刚才生成的授权码
EMAIL_FROM=你的QQ邮箱@qq.com
CRON_SECRET=随便输入一个密钥
```

### 3️⃣ 本地测试（1分钟）

```bash
npm run dev
```

打开 http://localhost:3000，添加一个测试邮箱。

### 4️⃣ 部署到Vercel（1分钟）

**方法A - 使用Vercel CLI（最快）：**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add EMAIL_FROM

# 创建KV数据库
# 访问 https://vercel.com/dashboard
# 进入项目 → Storage → Create Database → KV

# 重新部署
vercel --prod
```

**方法B - 使用GitHub：**

1. 推送到GitHub
2. 访问 https://vercel.com
3. Import项目
4. 添加环境变量
5. 创建KV数据库
6. 部署完成

## 完成！🎉

现在你的应用已经：
- ✅ 每30分钟自动检查业绩预增
- ✅ 发现连续预增股票自动发邮件
- ✅ 可以在网页上管理邮件列表
- ✅ 在中国网络可以正常访问

## 下一步

1. **添加订阅邮箱**：访问你的网站，添加要接收通知的邮箱
2. **查看当前数据**：点击刷新按钮查看最新的预增股票
3. **等待通知**：系统会自动检查并发送邮件

## 测试邮件功能

手动触发一次检查（可选）：

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.vercel.app/api/cron/check-earnings
```

## 常见问题

**Q: 本地开发时KV报错？**  
A: 本地开发不需要KV，可以先注释掉相关代码，或者使用Vercel的本地开发环境：
```bash
vercel dev
```

**Q: 收不到邮件？**  
A: 
1. 检查SMTP配置是否正确
2. 确认授权码不是邮箱密码
3. 查看Vercel函数日志

**Q: 如何查看日志？**  
A: Vercel Dashboard → 你的项目 → Logs

## 需要帮助？

查看完整文档：
- README.md - 完整功能说明
- DEPLOYMENT.md - 详细部署指南
