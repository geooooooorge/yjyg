# Vercel 部署指南

## 📋 前提条件

1. GitHub 仓库已创建：https://github.com/geooooooorge/yjyg
2. 代码已推送到 GitHub
3. 有 Vercel 账号（使用 GitHub 登录）

## 🚀 部署步骤

### 1. 导入项目到 Vercel

1. 访问 https://vercel.com
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 找到 `geooooooorge/yjyg` 仓库
5. 点击 **"Import"**

### 2. 配置项目

**Framework Preset**: Next.js (自动检测)

**Root Directory**: `./` (默认)

**Build Command**: `npm run build` (默认)

**Output Directory**: `.next` (默认)

### 3. 配置环境变量 ⚠️ 重要

点击 **"Environment Variables"**，添加以下变量：

#### 必需的环境变量

```bash
# SMTP 邮件配置（QQ邮箱示例）
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=QQ邮箱授权码（不是密码！）
EMAIL_FROM=你的QQ邮箱@qq.com

# Cron 任务密钥（随机字符串）
CRON_SECRET=your-random-secret-string-here
```

#### 如何获取QQ邮箱授权码

1. 登录 QQ 邮箱网页版
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启 **"POP3/SMTP服务"** 或 **"IMAP/SMTP服务"**
4. 点击 **"生成授权码"**
5. 按提示发送短信验证
6. 复制生成的授权码（16位字符）

### 4. 部署

点击 **"Deploy"** 按钮，等待部署完成（约2-3分钟）

### 5. 添加 Vercel KV 数据库

部署完成后：

1. 进入项目页面
2. 点击顶部 **"Storage"** 标签
3. 点击 **"Create Database"**
4. 选择 **"KV"**
5. 输入名称：`earnings-tracker-kv`
6. 选择区域：**Hong Kong** 或 **Singapore**（离中国近）
7. 点击 **"Create"**

KV 数据库的环境变量会自动添加到项目中：
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 6. 重新部署

添加 KV 后，需要重新部署：

1. 进入项目的 **"Deployments"** 标签
2. 点击最新的部署
3. 点击右上角的 **"..."** → **"Redeploy"**
4. 确认重新部署

## ✅ 验证部署

### 访问应用

部署成功后，你的应用会运行在：
- `https://yjyg.vercel.app` 或
- `https://yjyg-你的用户名.vercel.app`

### 测试功能

1. **添加邮箱**：在界面上添加一个测试邮箱
2. **查看股票列表**：点击刷新按钮，应该能看到业绩预增股票
3. **测试 Cron**：访问 `https://你的域名/api/cron/check-earnings`
   - 会返回 401 Unauthorized（正常，需要密钥）

### 查看日志

在 Vercel 项目页面：
1. 点击 **"Deployments"** 标签
2. 点击最新的部署
3. 点击 **"Functions"** 查看函数日志
4. 点击具体的函数查看详细日志

## 🔄 自动更新

### Cron 任务

系统会每 30 分钟自动运行一次检查：
- 时间：每小时的 0 分和 30 分
- 任务：检查新的业绩预增股票
- 通知：发现新股票会自动发送邮件

### 查看 Cron 日志

1. 进入项目页面
2. 点击 **"Logs"** 标签
3. 筛选 **"Cron"** 类型的日志

## 🔧 常见问题

### 1. 邮件发送失败

**问题**：收不到邮件通知

**解决方案**：
- 检查 SMTP 配置是否正确
- 确认使用的是授权码，不是邮箱密码
- 检查 QQ 邮箱是否开启了 SMTP 服务
- 查看 Vercel 函数日志中的错误信息

### 2. KV 数据库连接失败

**问题**：无法保存邮箱或股票记录

**解决方案**：
- 确认 KV 数据库已创建
- 检查环境变量是否自动添加
- 重新部署项目

### 3. Cron 任务不运行

**问题**：没有收到定时通知

**解决方案**：
- 确认 `vercel.json` 中的 cron 配置正确
- 查看 Vercel 项目的 Cron 日志
- Vercel 免费版 Cron 有时会有延迟

### 4. 构建失败

**问题**：部署时构建失败

**解决方案**：
- 检查 `package.json` 依赖是否完整
- 查看构建日志中的具体错误
- 确保本地 `npm run build` 能成功

## 📊 监控和维护

### 查看使用情况

在 Vercel 项目页面：
- **Analytics**：查看访问统计
- **Usage**：查看资源使用情况
- **Logs**：查看运行日志

### 更新代码

1. 本地修改代码
2. 提交到 GitHub：
   ```bash
   git add .
   git commit -m "Update message"
   git push origin main
   ```
3. Vercel 会自动检测并重新部署

## 🎉 完成

现在你的业绩预增跟踪器已经成功部署！

系统会每 30 分钟自动检查业绩预增数据，发现新股票会立即发送邮件通知。

---

**项目地址**: https://github.com/geooooooorge/yjyg
**部署平台**: Vercel
**数据来源**: 东方财富
