# 业绩预增跟踪器

自动跟踪东方财富业绩预增数据，发现连续两个季度预增的股票后自动发送邮件通知。

## 📚 文档导航

- 📖 **[完整文档索引](./DOCUMENTATION_INDEX.md)** - 所有文档的导航和使用指南
- 🏗️ **[项目架构文档](./PROJECT_ARCHITECTURE.md)** - 完整的技术架构和实现细节
- 🔄 **[复用模板](./REUSABLE_TEMPLATE.md)** - 可复用的功能模块和快速启动指南
- 🔧 **[技术栈速查](./TECH_STACK_REFERENCE.md)** - 技术栈详细参考和代码模板

> 💡 **提示**：如果你想深入了解项目或复用到其他项目，请查看上述文档。

## 功能特点

- 📊 **自动跟踪**：每半小时自动检查东方财富业绩预增接口
- 📧 **邮件通知**：发现连续预增股票立即发送邮件
- 👥 **订阅管理**：可添加/删除邮件订阅列表
- 🚀 **Vercel部署**：一键部署到Vercel，中国网络可访问
- 💾 **数据持久化**：使用Upstash Redis存储数据
- 🎨 **现代UI**：基于Tailwind CSS的美观界面

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **数据库**：Upstash Redis
- **邮件**：Nodemailer
- **部署**：Vercel

## 快速开始

### 1. 安装依赖

```bash
cd earnings-tracker
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入以下配置：

```env
# Upstash Redis 配置（必需）
# 从 https://console.upstash.com/ 获取
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# 邮件配置（推荐使用QQ邮箱或163邮箱）
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-email@qq.com
SMTP_PASS=your-smtp-authorization-code
EMAIL_FROM=your-email@qq.com

# Cron密钥（可选，增加安全性）
CRON_SECRET=your-random-secret-string
```

> 📖 **详细配置指南**：查看 [UPSTASH_SETUP.md](./UPSTASH_SETUP.md) 了解如何配置 Upstash Redis

#### 获取QQ邮箱SMTP授权码

1. 登录QQ邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
4. 生成授权码（不是QQ密码）
5. 将授权码填入 `SMTP_PASS`

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到Vercel

### 方法一：通过Vercel CLI

1. 安装Vercel CLI：
```bash
npm i -g vercel
```

2. 登录Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 配置 Upstash Redis：
   - 访问 [Upstash Console](https://console.upstash.com/)
   - 创建一个新的 Redis 数据库
   - 获取 REST API 的 URL 和 Token
   - 详细步骤见 [UPSTASH_SETUP.md](./UPSTASH_SETUP.md)

5. 配置环境变量：
   - 在Vercel Dashboard中进入项目设置
   - Settings → Environment Variables
   - 添加 Upstash 和邮件相关的环境变量

### 方法二：通过GitHub

1. 将代码推送到GitHub仓库

2. 访问 [Vercel](https://vercel.com)，导入GitHub仓库

3. 配置环境变量（同上）

4. 部署完成

## 使用说明

### 添加邮件订阅

1. 访问部署后的网站
2. 在"邮件订阅管理"区域输入邮箱
3. 点击"添加"按钮

### 查看当前预增股票

- 页面右侧显示当前连续预增的股票
- 点击刷新按钮手动更新数据

### 自动通知

- 系统每半小时自动检查一次（由Vercel Cron触发）
- 发现新的连续预增股票会自动发送邮件
- 同一股票同一季度只会发送一次通知

## API接口

### 获取邮件列表
```
GET /api/emails
```

### 添加邮件
```
POST /api/emails
Body: { "email": "user@example.com" }
```

### 删除邮件
```
DELETE /api/emails
Body: { "email": "user@example.com" }
```

### 获取业绩预增数据
```
GET /api/earnings
```

### Cron任务（由Vercel自动触发）
```
GET /api/cron/check-earnings
Header: Authorization: Bearer YOUR_CRON_SECRET
```

## 数据来源

- 东方财富业绩预告接口
- 数据每半小时更新一次
- 筛选条件：预增、略增、续盈、扭亏

## 注意事项

1. **邮件配置**：
   - 建议使用QQ邮箱或163邮箱的SMTP服务
   - 需要使用授权码，不是邮箱密码
   - 确保SMTP端口和加密方式正确

2. **服务限制**：
   - Vercel 免费版 Cron 任务每天有限制
   - Vercel 函数执行时间最长60秒
   - Upstash 免费版：10,000 命令/天，256 MB 存储

3. **中国网络访问**：
   - Vercel在中国可以正常访问
   - 东方财富API在中国网络环境下可用
   - 如遇访问问题，检查DNS设置

4. **数据准确性**：
   - 数据来自东方财富公开接口
   - 仅供参考，不构成投资建议
   - 请以官方公告为准

## 常见问题

### Q: 为什么收不到邮件？
A: 检查以下几点：
- SMTP配置是否正确
- 授权码是否有效
- 邮箱是否在订阅列表中
- 查看Vercel函数日志

### Q: Cron任务没有执行？
A: 
- 确认 `vercel.json` 配置正确
- 检查Vercel Dashboard中的Cron设置
- 查看函数执行日志

### Q: 如何测试Cron任务？
A: 可以直接访问：
```
https://your-domain.vercel.app/api/cron/check-earnings
```
（需要在Header中添加Authorization）

## 开发计划

- [ ] 支持更多筛选条件
- [ ] 添加微信通知
- [ ] 历史数据查看
- [ ] 自定义通知频率
- [ ] 移动端优化

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
