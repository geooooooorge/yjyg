# 部署指南

## 部署到Vercel的详细步骤

### 第一步：准备工作

1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录（推荐）

2. **准备邮箱SMTP**
   - 推荐使用QQ邮箱或163邮箱
   - 获取SMTP授权码（不是密码）

#### QQ邮箱SMTP设置

1. 登录QQ邮箱网页版
2. 点击"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"
5. 点击"生成授权码"，按提示操作
6. 保存生成的授权码（16位字符）

配置信息：
```
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=生成的授权码
EMAIL_FROM=你的QQ邮箱@qq.com
```

#### 163邮箱SMTP设置

1. 登录163邮箱网页版
2. 设置 → POP3/SMTP/IMAP
3. 开启"IMAP/SMTP服务"
4. 设置客户端授权密码
5. 保存授权密码

配置信息：
```
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=你的163邮箱@163.com
SMTP_PASS=授权密码
EMAIL_FROM=你的163邮箱@163.com
```

### 第二步：推送代码到GitHub

1. **创建GitHub仓库**
```bash
# 在项目目录下
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/earnings-tracker.git
git push -u origin main
```

### 第三步：在Vercel导入项目

1. 访问 https://vercel.com/dashboard
2. 点击"Add New..." → "Project"
3. 选择"Import Git Repository"
4. 选择你的GitHub仓库
5. 点击"Import"

### 第四步：配置环境变量

在Vercel项目设置页面：

1. 进入 "Settings" → "Environment Variables"
2. 添加以下环境变量：

```
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=your-email@qq.com
SMTP_PASS=your-authorization-code
EMAIL_FROM=your-email@qq.com
CRON_SECRET=随机生成一个密钥（可选）
```

**注意**：
- 每个变量都要选择 Production、Preview、Development 三个环境
- SMTP_PASS 是授权码，不是邮箱密码
- CRON_SECRET 可以用任意随机字符串

### 第五步：添加Vercel KV数据库

1. 在项目页面，点击 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "KV" (Redis)
4. 输入数据库名称（如：earnings-tracker-kv）
5. 选择区域（建议选择离中国近的区域）
6. 点击 "Create"

创建后，Vercel会自动添加以下环境变量：
- KV_URL
- KV_REST_API_URL
- KV_REST_API_TOKEN
- KV_REST_API_READ_ONLY_TOKEN

### 第六步：部署

1. 点击 "Deploy"
2. 等待部署完成（通常1-2分钟）
3. 部署成功后会显示域名

### 第七步：验证Cron任务

1. 进入项目的 "Settings" → "Cron Jobs"
2. 确认看到：
   - Path: `/api/cron/check-earnings`
   - Schedule: `*/30 * * * *` (每30分钟)
3. 如果没有，检查 `vercel.json` 文件

### 第八步：测试

1. **访问网站**
   - 打开Vercel提供的域名
   - 应该能看到界面

2. **添加邮箱**
   - 在界面上添加一个测试邮箱
   - 检查是否添加成功

3. **手动触发检查**（可选）
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
        https://your-domain.vercel.app/api/cron/check-earnings
   ```

4. **查看日志**
   - 在Vercel Dashboard → 项目 → "Logs"
   - 查看函数执行情况

## 自定义域名（可选）

1. 在Vercel项目设置中，进入 "Domains"
2. 添加你的域名
3. 按照提示配置DNS记录
4. 等待DNS生效

## 中国网络访问优化

Vercel在中国可以访问，但有时可能较慢。优化方案：

1. **使用自定义域名**
   - 可以提高访问速度
   - 避免某些网络限制

2. **CDN加速**（高级）
   - 使用Cloudflare等CDN
   - 配置CNAME到Vercel域名

## 监控和维护

### 查看Cron执行日志

1. Vercel Dashboard → 项目 → "Logs"
2. 筛选 `/api/cron/check-earnings`
3. 查看执行结果和错误信息

### 查看KV存储数据

1. Vercel Dashboard → 项目 → "Storage"
2. 点击KV数据库
3. 可以查看和管理存储的数据

### 常见问题排查

**问题1：收不到邮件**
- 检查SMTP配置是否正确
- 查看函数日志中的错误信息
- 测试SMTP连接是否正常
- 确认邮箱在订阅列表中

**问题2：Cron任务不执行**
- 检查 `vercel.json` 配置
- 查看Vercel的Cron Jobs设置
- 免费版有执行次数限制

**问题3：KV存储连接失败**
- 确认环境变量已正确设置
- 检查KV数据库状态
- 查看函数日志

**问题4：API请求失败**
- 东方财富API可能临时不可用
- 检查网络连接
- 查看具体错误信息

## 成本说明

### Vercel免费版限制

- **函数执行**：每月100GB-hours
- **Cron任务**：每天有限制
- **KV存储**：256MB
- **带宽**：100GB/月

对于个人使用，免费版完全够用。

### 升级Pro版（可选）

如果需要更多资源：
- 价格：$20/月
- 无限函数执行时间
- 更多Cron任务
- 更大存储空间

## 更新应用

当你修改代码后：

```bash
git add .
git commit -m "Update features"
git push
```

Vercel会自动检测并重新部署。

## 备份数据

定期备份邮件列表：

1. 访问 `/api/emails` 获取列表
2. 保存到本地文件
3. 或使用Vercel CLI导出KV数据

## 安全建议

1. **保护Cron端点**
   - 设置 CRON_SECRET
   - 不要公开分享

2. **保护邮箱信息**
   - 不要在前端暴露完整邮箱列表
   - 考虑添加身份验证

3. **限制API调用**
   - 添加速率限制
   - 防止滥用

## 技术支持

如遇问题：
1. 查看项目README.md
2. 检查Vercel文档
3. 查看GitHub Issues
4. 联系开发者

---

祝部署顺利！🚀
