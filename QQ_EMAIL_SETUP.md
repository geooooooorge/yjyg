# QQ邮箱配置指南

## 📧 使用QQ邮箱发送通知

### 第一步：获取QQ邮箱授权码

1. **登录QQ邮箱**
   - 访问 https://mail.qq.com
   - 使用你的QQ号登录

2. **开启SMTP服务**
   - 点击顶部"设置" → "账户"
   - 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 开启"POP3/SMTP服务"或"IMAP/SMTP服务"

3. **生成授权码**
   - 点击"生成授权码"
   - 按照提示发送短信（发送配置到指定号码）
   - 获得16位授权码（例如：abcdabcdabcdabcd）
   - **重要**：授权码只显示一次，请立即保存

### 第二步：配置环境变量

#### 本地开发配置

在项目根目录创建 `.env.local` 文件：

```env
# QQ邮箱SMTP配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ号@qq.com
SMTP_PASS=你的16位授权码

# 发件人显示名称（可选）
EMAIL_FROM=业绩预增跟踪器 <你的QQ号@qq.com>

# Vercel KV配置（部署时需要）
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
```

**示例**：
```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=123456789@qq.com
SMTP_PASS=abcdabcdabcdabcd
EMAIL_FROM=业绩预增跟踪器 <123456789@qq.com>
```

#### Vercel部署配置

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. Settings → Environment Variables
4. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SMTP_HOST` | `smtp.qq.com` | QQ邮箱SMTP服务器 |
| `SMTP_PORT` | `465` | SMTP端口（SSL） |
| `SMTP_USER` | `你的QQ号@qq.com` | 你的QQ邮箱 |
| `SMTP_PASS` | `你的16位授权码` | QQ邮箱授权码 |
| `EMAIL_FROM` | `业绩预增跟踪器 <你的QQ号@qq.com>` | 发件人显示 |

5. 点击"Save"保存
6. 重新部署项目

### 第三步：测试邮件发送

#### 本地测试

```bash
# 1. 确保.env.local配置正确
# 2. 启动开发服务器
npm run dev

# 3. 访问管理页面
# http://localhost:3000/admin

# 4. 添加测试邮箱

# 5. 手动触发邮件发送（测试）
# 访问：http://localhost:3000/api/cron/check-earnings
```

#### 生产环境测试

部署到Vercel后：
1. 在主页添加订阅邮箱
2. 等待Cron任务执行（每30分钟）
3. 或在管理页面查看发送历史

## 🔧 QQ邮箱特殊说明

### 支持的邮箱类型
- ✅ 普通QQ邮箱：123456789@qq.com
- ✅ VIP邮箱：username@vip.qq.com
- ✅ Foxmail邮箱：username@foxmail.com

### SMTP服务器配置
- **服务器地址**：smtp.qq.com
- **端口**：465（SSL）或 587（TLS）
- **加密方式**：SSL/TLS

### 常见问题

#### 1. 授权码错误（535 Login Fail）
**原因**：
- 授权码输入错误
- 未开启SMTP服务
- 授权码已过期

**解决**：
- 重新生成授权码
- 确认SMTP服务已开启
- 检查环境变量配置

#### 2. 连接超时
**原因**：
- 网络问题
- 端口被封
- 防火墙拦截

**解决**：
- 检查网络连接
- 尝试使用587端口
- 关闭防火墙测试

#### 3. 邮件进入垃圾箱
**原因**：
- 发件人信誉度低
- 邮件内容触发垃圾邮件规则

**解决**：
- 让收件人将邮箱加入白名单
- 优化邮件内容
- 避免频繁发送

#### 4. 每日发送限制
QQ邮箱有发送限制：
- 普通用户：约500封/天
- VIP用户：约1000封/天

**建议**：
- 控制订阅人数
- 合并发送（一次发送给多人）

## 📝 完整配置示例

### .env.local 文件
```env
# QQ邮箱配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=123456789@qq.com
SMTP_PASS=abcdabcdabcdabcd
EMAIL_FROM=业绩预增跟踪器 <123456789@qq.com>

# Vercel KV（可选，本地开发不需要）
# KV_REST_API_URL=https://xxx.kv.vercel-storage.com
# KV_REST_API_TOKEN=xxx

# Cron密钥（可选）
# CRON_SECRET=your-secret-key
```

## ⚠️ 安全提醒

1. **不要泄露授权码**
   - 授权码等同于密码
   - 不要提交到Git仓库
   - 不要分享给他人

2. **定期更换授权码**
   - 建议每3-6个月更换一次
   - 如果泄露立即重新生成

3. **使用独立邮箱**
   - 建议使用专门的邮箱发送通知
   - 不要使用主要邮箱

## 🚀 快速开始

```bash
# 1. 创建.env.local文件
echo "SMTP_HOST=smtp.qq.com" > .env.local
echo "SMTP_PORT=465" >> .env.local
echo "SMTP_USER=你的QQ邮箱" >> .env.local
echo "SMTP_PASS=你的授权码" >> .env.local

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000
```

## 📞 需要帮助？

如果遇到问题：
1. 检查授权码是否正确
2. 确认SMTP服务已开启
3. 查看控制台错误信息
4. 参考上面的常见问题

---

配置完成后，系统将自动通过你的QQ邮箱发送业绩预增通知！
