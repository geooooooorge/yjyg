# 搜狐邮箱配置指南

## 📧 使用搜狐邮箱发送通知

### 邮箱信息
- **邮箱地址**: 15010606939@sohu.com
- **SMTP服务器**: smtp.sohu.com
- **端口**: 465 (SSL)

## 🔑 获取搜狐邮箱授权码/密码

### 方法1：使用邮箱密码（如果SMTP服务已开启）
1. 登录 https://mail.sohu.com
2. 设置 → 客户端设置
3. 查看是否已开启SMTP服务
4. 如果已开启，可以直接使用邮箱登录密码

### 方法2：开启SMTP服务并获取授权码
1. 登录搜狐邮箱
2. 进入"设置" → "客户端设置"
3. 开启"POP3/SMTP服务"
4. 按照提示获取授权码（如果需要）

**注意**: 搜狐邮箱的SMTP配置可能与QQ邮箱不同，部分账户可能直接使用登录密码。

## ⚙️ 配置步骤

### 本地开发配置

在项目根目录的 `.env.local` 文件中添加：

```env
# 搜狐邮箱SMTP配置
SMTP_HOST=smtp.sohu.com
SMTP_PORT=465
SMTP_USER=15010606939@sohu.com
SMTP_PASS=你的邮箱密码或授权码

# 发件人显示名称
EMAIL_FROM=业绩预增跟踪器 <15010606939@sohu.com>
```

### Vercel部署配置

1. 访问 https://vercel.com/dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `SMTP_HOST` | `smtp.sohu.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `15010606939@sohu.com` |
| `SMTP_PASS` | `你的邮箱密码或授权码` |
| `EMAIL_FROM` | `业绩预增跟踪器 <15010606939@sohu.com>` |

## 🧪 测试SMTP连接

使用测试脚本验证配置：

```bash
# 编辑 test-smtp.js，修改配置为：
const user = '15010606939@sohu.com';
const pass = '你的密码';
const config = {
  host: 'smtp.sohu.com',
  port: 465,
  ...
};

# 运行测试
node test-smtp.js
```

## ⚠️ 常见问题

### 1. 连接失败
**可能原因**：
- SMTP服务未开启
- 密码错误
- 端口被封

**解决方法**：
- 确认SMTP服务已开启
- 检查密码是否正确
- 尝试使用25端口（非SSL）

### 2. 认证失败
**可能原因**：
- 密码错误
- 需要使用授权码而不是登录密码

**解决方法**：
- 重新确认密码
- 查看邮箱设置中是否需要授权码

### 3. 搜狐邮箱特殊说明
- 搜狐邮箱可能需要在网页端先发送一封邮件激活SMTP功能
- 部分账户可能需要绑定手机号才能使用SMTP
- 建议先在网页端测试发送邮件

## 📝 配置示例

### .env.local 完整示例

```env
# 搜狐邮箱配置
SMTP_HOST=smtp.sohu.com
SMTP_PORT=465
SMTP_USER=15010606939@sohu.com
SMTP_PASS=your_password_here
EMAIL_FROM=业绩预增跟踪器 <15010606939@sohu.com>

# Vercel KV（可选）
# KV_REST_API_URL=https://xxx.kv.vercel-storage.com
# KV_REST_API_TOKEN=xxx
```

## 🔄 如果搜狐邮箱不可用

可以考虑使用其他邮箱服务：
- **QQ邮箱**: smtp.qq.com:465（需要授权码）
- **163邮箱**: smtp.163.com:465（需要授权码）
- **Gmail**: smtp.gmail.com:587（需要应用专用密码）
- **Outlook**: smtp-mail.outlook.com:587

## 📞 需要帮助？

如果配置遇到问题：
1. 检查邮箱设置中的SMTP配置
2. 确认密码/授权码正确
3. 查看终端错误日志
4. 尝试使用 test-smtp.js 脚本测试

---

**当前配置**: 15010606939@sohu.com  
**SMTP服务器**: smtp.sohu.com:465
