# 🚀 快速开始指南

按照以下步骤快速配置和启动项目。

## ⏱️ 5分钟快速配置

### 第 1 步：运行配置助手（Windows）

```bash
setup-env.bat
```

或者手动复制：

```bash
copy .env.example .env.local
```

### 第 2 步：获取 Upstash Redis 配置

1. **访问** [https://console.upstash.com/](https://console.upstash.com/)

2. **注册/登录**（免费账号）

3. **创建数据库**
   - 点击 "Create Database"
   - Name: `earnings-tracker`
   - Type: `Regional`
   - Region: 选择 `ap-southeast-1`（新加坡）或其他亚洲区域
   - 点击 "Create"

4. **复制连接信息**
   - 在数据库详情页，找到 **REST API** 部分
   - 复制 `UPSTASH_REDIS_REST_URL`
   - 复制 `UPSTASH_REDIS_REST_TOKEN`

### 第 3 步：配置环境变量

编辑 `.env.local` 文件，粘贴你的 Upstash 配置：

```env
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
```

### 第 4 步：安装依赖并测试连接

```bash
# 安装依赖（如果还没安装）
npm install

# 测试 Upstash 连接
npm run test:upstash
```

如果看到 `✅ 所有测试通过！` 说明配置成功！

### 第 5 步：启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## ✅ 验证配置

启动后，你应该在终端看到：

```
✅ Upstash Redis initialized
✅ Settings API: Upstash Redis initialized
```

如果看到警告信息，说明配置有问题，请检查环境变量。

## 📊 查看存储的数据

### 方法 1：Upstash 控制台（推荐）

1. 访问 [https://console.upstash.com/](https://console.upstash.com/)
2. 选择你的数据库
3. 点击 "Data Browser"
4. 输入命令查看数据：

```redis
# 查看所有 keys
KEYS *

# 查看邮件列表
GET email_list

# 查看历史股票数据
GET all_stocks_history
```

### 方法 2：使用应用

1. 在应用中添加邮箱
2. 点击"刷新数据"按钮
3. 返回 Upstash 控制台查看数据

## 🎯 下一步

- **添加邮箱订阅**：在首页添加你的邮箱地址
- **初始化历史数据**：访问 `http://localhost:3000/api/init-history`
- **查看数据**：在 Upstash 控制台查看存储的数据
- **部署到 Vercel**：参考 [README.md](./README.md) 的部署说明

## ❓ 遇到问题？

### 问题 1：看到 "using memory storage" 警告

**原因**：环境变量未正确配置

**解决**：
1. 确认 `.env.local` 文件存在
2. 检查变量名拼写是否正确
3. 重启开发服务器

### 问题 2：测试连接失败

**原因**：Upstash 配置错误或网络问题

**解决**：
1. 检查 URL 和 Token 是否完整复制
2. 确认 Upstash 数据库状态为 Active
3. 检查网络连接

### 问题 3：数据库是空的

**原因**：还没有使用应用功能

**解决**：
1. 在应用中添加邮箱
2. 点击刷新按钮获取股票数据
3. 访问 `/api/init-history` 初始化历史数据

## 📚 更多信息

- **详细配置指南**：[UPSTASH_SETUP.md](./UPSTASH_SETUP.md)
- **完整文档**：[README.md](./README.md)
- **Upstash 文档**：[https://docs.upstash.com/](https://docs.upstash.com/)
