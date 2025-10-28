# 🚀 Vercel 环境变量配置指南

## ❌ 当前问题
页面显示：`AI API key not configured`

这是因为 Vercel 部署环境中缺少 `QWEN_API_KEY` 环境变量。

---

## ✅ 解决方案

### 方法 1：通过 Vercel Dashboard（推荐）

1. **访问 Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **选择项目**
   - 找到并点击 `yjyg` 项目

3. **进入设置**
   - 点击顶部的 **Settings** 标签

4. **添加环境变量**
   - 左侧菜单选择 **Environment Variables**
   - 点击 **Add New** 按钮

5. **填写变量**
   ```
   Name:  QWEN_API_KEY
   Value: sk-fefa9fed5599445abd3532c3b8187488
   ```

6. **选择环境**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. **保存并重新部署**
   - 点击 **Save**
   - 进入 **Deployments** 标签
   - 点击最新部署右侧的 **⋯** → **Redeploy**

---

### 方法 2：通过 Vercel CLI

如果你安装了 Vercel CLI：

```bash
# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add QWEN_API_KEY

# 输入值：sk-fefa9fed5599445abd3532c3b8187488
# 选择环境：Production, Preview, Development（全选）

# 重新部署
vercel --prod
```

---

## 📋 完整的环境变量清单

确保 Vercel 中配置了以下所有环境变量：

### 1. Upstash Redis（必需）
```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### 2. 阿里千问 AI（必需）
```
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
```

### 3. 邮件服务（必需）
```
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your_email@163.com
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email@163.com
```

### 4. Cron 密钥（可选，增强安全性）
```
CRON_SECRET=your_random_secret_string
```

---

## 🔍 验证配置

### 1. 检查环境变量
在 Vercel Dashboard → Settings → Environment Variables 中确认所有变量都已添加。

### 2. 触发重新部署
- 方式 1：在 Dashboard 中手动 Redeploy
- 方式 2：推送新的代码到 GitHub
- 方式 3：使用 Vercel CLI `vercel --prod`

### 3. 查看部署日志
- 进入 Deployments 标签
- 点击最新的部署
- 查看 **Build Logs** 和 **Function Logs**
- 确认没有环境变量相关的错误

### 4. 测试页面
访问你的网站，应该看到：
```
✅ AI API 连接成功 (响应时间)
```

---

## 🐛 常见问题

### Q1: 添加环境变量后还是显示未配置
**A**: 需要重新部署才能生效。添加环境变量后，必须触发一次新的部署。

### Q2: 如何查看当前配置的环境变量
**A**: Vercel Dashboard → Settings → Environment Variables，可以看到所有已配置的变量（值会被隐藏）。

### Q3: 环境变量在本地开发中不生效
**A**: 本地开发使用 `.env.local` 文件，不会读取 Vercel 的环境变量。

### Q4: 如何删除或修改环境变量
**A**: 在 Environment Variables 页面，点击变量右侧的 **⋯** → **Edit** 或 **Remove**。

---

## 📞 需要帮助？

如果配置后仍然有问题，请检查：

1. **Function Logs**（Vercel Dashboard → Deployments → 点击部署 → Functions 标签）
2. **Runtime Logs**（查看 API 调用的实时日志）
3. **错误信息**（页面上显示的具体错误）

---

**最后更新**：2025-10-28  
**维护者**：geooooooorge
