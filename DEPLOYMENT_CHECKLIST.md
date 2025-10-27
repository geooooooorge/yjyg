# ✅ Vercel 部署前检查清单

## 📋 本地验证（已完成）

- [x] **Upstash Redis 连接测试**
  ```bash
  npm run test:upstash
  ```
  结果：✅ 所有测试通过

- [x] **存储功能验证**
  ```bash
  npm run verify:storage
  ```
  结果：
  - ✅ 邮件列表：1 个邮箱
  - ✅ 历史股票数据：193 只股票
  - ✅ 邮件历史：0 条（正常，还未发送）
  - ✅ 数据库 Keys：4 个

- [x] **Admin 界面功能**
  - ✅ 邮箱列表显示正常
  - ✅ 股票数据显示正常（193只）
  - ✅ 发送历史显示正常（0条）
  - ✅ 系统设置正常

- [x] **本地开发服务器**
  - ✅ 启动成功
  - ✅ Upstash Redis 初始化成功
  - ✅ API 端点正常响应

---

## 🚀 Vercel 部署步骤

### 步骤 1：准备环境变量

在 Vercel Dashboard 中添加以下环境变量：

#### 必需的环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `UPSTASH_REDIS_REST_URL` | `https://firm-oarfish-7692.upstash.io` | Production, Preview, Development |
| `UPSTASH_REDIS_REST_TOKEN` | `AR4MAAImcDI1MTc3NDUxYTMwNjk0YTg4OTQyYmMyMTM5ZTM4ZmRkN3AyNzY5Mg` | Production, Preview, Development |

#### 可选的环境变量（邮件功能）：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SMTP_HOST` | SMTP 服务器 | `smtp.qq.com` |
| `SMTP_PORT` | SMTP 端口 | `465` |
| `SMTP_USER` | 邮箱账号 | `your@qq.com` |
| `SMTP_PASS` | SMTP 授权码 | `授权码` |
| `EMAIL_FROM` | 发件人邮箱 | `your@qq.com` |
| `CRON_SECRET` | Cron 安全密钥 | `随机字符串` |

### 步骤 2：部署方式选择

#### 方式 A：通过 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署到生产环境
vercel --prod

# 4. 添加环境变量
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

#### 方式 B：通过 GitHub

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Ready for Vercel deployment with Upstash Redis"
git push origin main

# 2. 在 Vercel Dashboard 导入 GitHub 仓库
# 3. 在部署设置中添加环境变量
# 4. 点击 Deploy
```

### 步骤 3：部署后验证

#### 3.1 检查部署日志

在 Vercel Dashboard → Deployments → 查看最新部署：

- [ ] Build 成功
- [ ] Function Logs 中看到 `✅ Upstash Redis initialized`
- [ ] 没有连接错误

#### 3.2 测试 API 端点

```bash
# 替换为你的 Vercel 域名
DOMAIN="your-app.vercel.app"

# 测试邮件列表
curl https://$DOMAIN/api/emails

# 测试股票数据
curl https://$DOMAIN/api/earnings?type=all

# 测试邮件历史
curl https://$DOMAIN/api/email-history
```

期望结果：
- [ ] `/api/emails` 返回邮箱列表
- [ ] `/api/earnings` 返回股票数据
- [ ] `/api/email-history` 返回历史记录

#### 3.3 访问 Admin 界面

访问 `https://your-app.vercel.app/admin`

验证：
- [ ] 邮箱列表显示正常
- [ ] 股票数据显示正常（193只）
- [ ] 发送历史显示正常
- [ ] 可以刷新数据
- [ ] 可以导出数据

#### 3.4 验证 Upstash 数据

访问 https://console.upstash.com/

在 Data Browser 中执行：

```redis
# 查看所有 keys
KEYS *

# 查看邮件列表
GET email_list

# 查看历史股票数据
GET all_stocks_history

# 查看邮件历史
GET email_history
```

验证：
- [ ] 可以看到 4 个 keys
- [ ] `email_list` 有数据
- [ ] `all_stocks_history` 有 193 只股票
- [ ] 数据与本地一致

### 步骤 4：功能测试

#### 4.1 测试添加邮箱

1. 访问首页
2. 添加一个测试邮箱
3. 在 Admin 界面查看是否显示
4. 在 Upstash 控制台验证是否存储

#### 4.2 测试初始化历史数据

1. 访问 Admin 界面
2. 点击"初始化数据"按钮
3. 等待完成
4. 验证股票数量是否更新

#### 4.3 测试 Cron 任务（可选）

Vercel 会自动启用 `vercel.json` 中配置的 Cron 任务：

- [ ] 每 5 分钟检查业绩预告（`/api/cron/check-earnings`）
- [ ] 每天 0 点发送汇总（`/api/cron/daily-summary`）

在 Vercel Dashboard → Cron Jobs 查看执行状态。

---

## 🔍 故障排查

### 问题 1：部署成功但无法连接 Upstash

**症状**：
- Function Logs 显示 `⚠️ using memory storage`
- Admin 界面数据为空

**解决**：
1. 检查环境变量是否正确添加
2. 确认环境变量选择了 Production 环境
3. 重新部署：`vercel --prod`

### 问题 2：数据显示为空

**症状**：
- API 返回空数据
- Admin 界面显示 0

**解决**：
1. 检查 Upstash 数据库状态是否 Active
2. 在 Upstash 控制台执行 `KEYS *` 查看是否有数据
3. 如果没有数据，点击"初始化数据"按钮

### 问题 3：Cron 任务不执行

**症状**：
- 没有收到邮件通知
- Cron Jobs 页面显示错误

**解决**：
1. 检查 `vercel.json` 配置是否正确
2. 手动触发测试：`curl https://your-app.vercel.app/api/cron/check-earnings`
3. 查看 Function Logs 的错误信息

---

## 📊 验证完成标准

所有以下项目都应该 ✅：

### 本地环境
- [x] Upstash 连接测试通过
- [x] 存储功能验证通过
- [x] Admin 界面正常显示
- [x] API 端点正常响应

### Vercel 环境
- [ ] 部署成功，无错误
- [ ] 环境变量配置正确
- [ ] Function Logs 显示 Upstash 初始化成功
- [ ] Admin 界面可以访问
- [ ] API 端点返回正确数据
- [ ] Upstash 控制台可以看到数据
- [ ] 可以添加/删除邮箱
- [ ] 可以初始化历史数据
- [ ] Cron 任务正常运行（可选）

---

## 🎉 部署完成

当所有验证项都通过后，你的应用就成功部署了！

### 下一步：

1. **监控**：定期查看 Vercel Function Logs 和 Upstash 使用情况
2. **备份**：使用 Admin 界面的"导出数据"功能定期备份
3. **优化**：根据实际使用情况调整通知频率
4. **扩展**：添加更多功能，如微信通知、自定义筛选等

### 有用的链接：

- **应用地址**：https://your-app.vercel.app
- **Admin 界面**：https://your-app.vercel.app/admin
- **Vercel Dashboard**：https://vercel.com/dashboard
- **Upstash Console**：https://console.upstash.com/
- **项目文档**：[README.md](./README.md)

---

**需要帮助？** 查看 [UPSTASH_SETUP.md](./UPSTASH_SETUP.md) 或 [配置完成说明.md](./配置完成说明.md)
