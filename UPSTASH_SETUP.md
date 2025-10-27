# Upstash Redis 配置指南

## 📋 步骤 1：创建 Upstash Redis 数据库

1. **访问 Upstash 控制台**
   - 打开 [https://console.upstash.com/](https://console.upstash.com/)
   - 如果没有账号，先注册一个（免费）

2. **创建新的 Redis 数据库**
   - 点击 "Create Database" 按钮
   - 选择配置：
     - **Name**: 给数据库起个名字，例如 `earnings-tracker`
     - **Type**: 选择 `Regional`（免费版）
     - **Region**: 选择离你最近的区域（建议选择亚洲区域，如 `ap-southeast-1`）
     - **Eviction**: 选择 `noeviction`（不自动删除数据）
   - 点击 "Create" 创建数据库

3. **获取连接信息**
   - 创建完成后，进入数据库详情页面
   - 找到 **REST API** 部分
   - 你会看到两个重要信息：
     - `UPSTASH_REDIS_REST_URL`: 类似 `https://xxxxx.upstash.io`
     - `UPSTASH_REDIS_REST_TOKEN`: 一串长字符串

## 📋 步骤 2：配置本地环境变量

1. **复制示例文件**
   ```bash
   # 在项目根目录执行
   copy .env.example .env.local
   ```

2. **编辑 `.env.local` 文件**
   - 打开 `.env.local` 文件
   - 将从 Upstash 控制台复制的值粘贴进去：
   
   ```env
   UPSTASH_REDIS_REST_URL=https://your-actual-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
   ```

3. **保存文件**

## 📋 步骤 3：重启开发服务器

1. **停止当前运行的服务器**
   - 在终端按 `Ctrl + C`

2. **重新启动**
   ```bash
   npm run dev
   ```

3. **检查连接状态**
   - 查看终端输出，应该看到：
     ```
     ✅ Upstash Redis initialized
     ```
   - 如果看到警告信息，说明配置有问题

## 📋 步骤 4：查看存储的数据

### 方法 1：使用 Upstash 控制台（推荐）

1. **访问 Data Browser**
   - 在 Upstash 控制台中，进入你的数据库
   - 点击左侧菜单的 "Data Browser" 或 "CLI"

2. **查看所有 Keys**
   ```redis
   KEYS *
   ```
   这会显示所有存储的键名

3. **查看具体数据**
   ```redis
   # 查看邮件列表
   GET email_list
   
   # 查看所有历史股票数据
   GET all_stocks_history
   
   # 查看已发送的股票记录
   KEYS sent_stocks:*
   
   # 查看今天的新增股票
   KEYS daily_new_stocks:*
   
   # 查看邮件发送历史
   GET email_history
   ```

### 方法 2：使用 Redis CLI

如果你安装了 Redis CLI，可以使用 Upstash 提供的连接命令：

```bash
redis-cli -u redis://default:YOUR_TOKEN@YOUR_URL:PORT
```

### 方法 3：通过应用界面

1. 启动应用后访问 `http://localhost:3000`
2. 使用应用的功能：
   - 添加邮箱订阅
   - 爬取股票数据
   - 查看历史记录
3. 这些操作会自动将数据存储到 Upstash

## 🔍 验证数据存储

### 测试步骤：

1. **添加一个测试邮箱**
   - 在应用中添加一个邮箱地址
   - 在 Upstash 控制台执行：`GET email_list`
   - 应该能看到你添加的邮箱

2. **初始化历史数据**
   - 访问：`http://localhost:3000/api/init-history`
   - 这会将所有历史数据存储到数据库
   - 在 Upstash 控制台执行：`GET all_stocks_history`
   - 应该能看到股票数据

3. **检查数据大小**
   - 在 Upstash 控制台的 "Details" 页面
   - 可以看到数据库的使用情况（存储大小、键数量等）

## 🎯 项目中存储的数据类型

| Key 名称 | 用途 | 过期时间 |
|---------|------|---------|
| `email_list` | 邮件订阅列表 | 永久 |
| `sent_stocks:{code}:{quarter}` | 已发送的股票记录 | 90天 |
| `stocks_cache` | 股票数据缓存 | 5分钟 |
| `all_stocks_history` | 所有历史股票数据 | 永久 |
| `email_history` | 邮件发送历史（最多100条） | 永久 |
| `daily_new_stocks:{date}` | 每日新增股票 | 永久 |
| `app_settings` | 应用设置 | 永久 |

## ⚠️ 常见问题

### 1. 看到 "using memory storage" 警告
- 说明环境变量配置不正确
- 检查 `.env.local` 文件是否存在
- 检查变量名是否正确（不要有拼写错误）
- 确保重启了开发服务器

### 2. Upstash 控制台看不到数据
- 确认应用已经执行了存储操作
- 检查是否选择了正确的数据库
- 尝试刷新 Data Browser 页面

### 3. 免费额度限制
- Upstash 免费版有以下限制：
  - 10,000 命令/天
  - 256 MB 存储空间
- 对于这个项目来说，免费版完全够用

## 🚀 下一步

配置完成后，你可以：

1. 使用应用的所有功能
2. 在 Upstash 控制台实时查看数据变化
3. 如果需要部署到生产环境（如 Vercel），在部署平台的环境变量中添加相同的配置

## 📞 需要帮助？

如果遇到问题：
1. 检查终端的错误信息
2. 查看 Upstash 控制台的连接状态
3. 确认环境变量格式正确（没有多余的空格或引号）
