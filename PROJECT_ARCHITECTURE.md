# 📚 业绩预增跟踪器 - 项目架构文档

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心功能](#核心功能)
- [数据库设计](#数据库设计)
- [API 接口](#api-接口)
- [环境配置](#环境配置)
- [部署流程](#部署流程)
- [开发指南](#开发指南)

---

## 项目概述

### 项目名称
业绩预增跟踪器 (Earnings Tracker)

### 项目描述
一个自动化的股票业绩预增公告跟踪系统，实时监控东方财富网的业绩预告数据，当发现新的预增公告时自动发送邮件通知订阅用户。

### 核心价值
- 🚀 **自动化监控**：每5分钟自动检查新公告
- 📧 **即时通知**：发现新公告立即推送邮件
- 📊 **数据可视化**：美观的 UI 展示股票数据
- 💾 **数据持久化**：使用 Upstash Redis 存储
- 🌐 **全球部署**：Vercel 部署，中国可访问

---

## 技术栈

### 前端框架
```json
{
  "framework": "Next.js 14.2.5",
  "language": "TypeScript",
  "ui": "React 18.3.1",
  "styling": "Tailwind CSS",
  "icons": "Lucide React"
}
```

### 后端技术
```json
{
  "runtime": "Node.js",
  "framework": "Next.js API Routes",
  "http": "Axios 1.7.2",
  "email": "Nodemailer 6.9.13"
}
```

### 数据库
```json
{
  "database": "Upstash Redis",
  "client": "@upstash/redis 1.35.6",
  "type": "Serverless Redis"
}
```

### 部署平台
```json
{
  "platform": "Vercel",
  "features": [
    "Serverless Functions",
    "Cron Jobs",
    "Environment Variables",
    "Auto Deployment"
  ]
}
```

### 数据源
```json
{
  "provider": "东方财富网",
  "api": "datacenter-web.eastmoney.com",
  "data": "业绩预告数据"
}
```

---

## 项目结构

```
earnings-tracker/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── cron/                 # 定时任务
│   │   │   ├── check-earnings/   # 检查新公告
│   │   │   └── daily-summary/    # 每日汇总
│   │   ├── debug/                # 调试接口
│   │   ├── earnings/             # 股票数据 API
│   │   ├── email-history/        # 邮件历史 API
│   │   ├── emails/               # 邮箱管理 API
│   │   ├── online/               # 在线人数 API
│   │   ├── send-email/           # 发送邮件 API
│   │   └── settings/             # 系统设置 API
│   ├── admin/                    # 管理后台
│   │   └── page.tsx              # 管理页面
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
│
├── lib/                          # 工具库
│   ├── eastmoney.ts              # 东方财富 API
│   ├── email.ts                  # 邮件服务
│   └── storage.ts                # 数据存储
│
├── public/                       # 静态资源
│
├── .env.local                    # 环境变量（本地）
├── .env.example                  # 环境变量模板
├── next.config.mjs               # Next.js 配置
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
├── vercel.json                   # Vercel 配置（Cron）
├── package.json                  # 依赖管理
│
└── docs/                         # 文档
    ├── DEPLOYMENT_CHECKLIST.md   # 部署清单
    ├── UPSTASH_SETUP.md          # Upstash 配置
    ├── QUICK_START.md            # 快速开始
    └── PROJECT_ARCHITECTURE.md   # 本文档
```

---

## 核心功能

### 1. 📧 邮件订阅管理

**功能描述**
- 用户可以添加/删除订阅邮箱
- 支持多个邮箱订阅
- 邮箱数据持久化存储

**技术实现**
```typescript
// API: /api/emails
// 方法: GET, POST, DELETE
// 存储: Redis key: 'email_list'
```

**前端组件**
- 邮箱输入框
- 添加按钮
- 邮箱列表（带删除功能）

---

### 2. 📊 股票数据展示

**功能描述**
- 显示近7天的业绩预增公告
- 按季度分组展示
- 显示股票代码、名称、预增幅度、公告日期
- 点击可查看完整公告

**数据来源**
```typescript
// 东方财富 API
const url = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
const params = {
  reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
  filter: '(PREDICT_TYPE in ("预增","略增","续盈","扭亏")) and (PREDICT_FINANCE_CODE="004")',
  pageSize: 500
};
```

**数据过滤**
- 只显示近7天的公告
- 同一股票同一季度只保留最新一条
- 按公告日期倒序排列

---

### 3. 🔔 自动邮件通知

**功能描述**
- 每5分钟检查一次新公告
- 发现新公告立即发送邮件
- 每日08:00发送汇总邮件

**邮件模板**
```html
⚡ 业绩预增即时提醒
🔔 共发现 X 只股票发布业绩预增公告（近7天）

[股票列表]
- 股票名称 (代码)
- 预增类型: XX% ~ XX%
- 报告期: 2025年Q3
- 公告日期: 2025-10-24
- [查看完整公告]
```

**Cron 配置**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-earnings",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

### 4. 💾 数据持久化

**存储方案**
- 使用 Upstash Redis（Serverless）
- 支持本地内存降级

**数据结构**
```typescript
// 1. 邮件列表
key: 'email_list'
value: string[]
example: ['user1@example.com', 'user2@example.com']

// 2. 历史股票数据
key: 'all_stocks_history'
value: {
  count: number,
  updatedAt: string,
  data: Stock[]
}

// 3. 已发送股票记录
key: 'sent_stocks'
value: Set<string>  // 股票代码集合

// 4. 邮件发送历史
key: 'email_history'
value: EmailHistory[]

// 5. 在线用户
key: 'online_users'
value: OnlineUser[]

// 6. 系统设置
key: 'app_settings'
value: {
  notificationFrequency: number
}

// 7. 缓存数据
key: 'stocks_cache'
value: Stock[]
ttl: 300 seconds
```

---

### 5. 👥 在线人数统计

**功能描述**
- 右上角实时显示在线人数
- 每15秒发送心跳
- 30秒无心跳自动下线

**技术实现**
```typescript
// 每个用户生成唯一 ID
const userId = `user_${Date.now()}_${Math.random()}`;

// 心跳机制
setInterval(updateOnlineStatus, 15000);

// 超时检测
const HEARTBEAT_TIMEOUT = 30000;
```

---

### 6. 🎛️ 管理后台

**功能模块**
1. **数据统计**
   - 订阅邮箱数量
   - 预增股票数量
   - 发送历史数量

2. **数据管理**
   - 邮箱列表查看/删除
   - 股票数据查看
   - 发送历史查看

3. **系统操作**
   - 初始化历史数据
   - 测试邮件发送
   - 刷新数据
   - 导出数据

4. **系统设置**
   - 通知频率设置

---

## 数据库设计

### Upstash Redis 配置

**连接方式**
```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
// 或
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

**数据操作**
```typescript
// 读取
const value = await redis.get<T>(key);

// 写入
await redis.set(key, value);

// 写入（带过期）
await redis.set(key, value, { ex: seconds });

// 删除
await redis.del(key);

// 查看所有 keys
const keys = await redis.keys('*');
```

**存储限制**
- 免费版：10,000 命令/天
- 存储空间：256 MB
- 连接方式：REST API

---

## API 接口

### 1. 邮箱管理

#### GET /api/emails
获取所有订阅邮箱

**响应**
```json
{
  "success": true,
  "emails": ["user@example.com"]
}
```

#### POST /api/emails
添加订阅邮箱

**请求**
```json
{
  "email": "user@example.com"
}
```

**响应**
```json
{
  "success": true,
  "message": "Email added successfully"
}
```

#### DELETE /api/emails
删除订阅邮箱

**请求**
```json
{
  "email": "user@example.com"
}
```

---

### 2. 股票数据

#### GET /api/earnings?type={type}
获取股票数据

**参数**
- `type=today`: 今日新增（近7天）
- `type=recent`: 近7天数据
- `type=all`: 全部历史数据

**响应**
```json
{
  "success": true,
  "count": 9,
  "stocks": [
    {
      "stockCode": "688550",
      "stockName": "瑞联新材",
      "reports": [
        {
          "quarter": "2025-09-30",
          "forecastType": "预增",
          "changeMin": 59.26,
          "changeMax": 59.26,
          "reportDate": "2025-10-24"
        }
      ]
    }
  ],
  "type": "today"
}
```

---

### 3. 邮件历史

#### GET /api/email-history
获取邮件发送历史

**响应**
```json
{
  "success": true,
  "history": [
    {
      "sentAt": "2025-10-27T10:30:00Z",
      "recipients": ["user@example.com"],
      "stockCount": 5,
      "type": "instant"
    }
  ]
}
```

---

### 4. 在线人数

#### GET /api/online
获取在线人数

**响应**
```json
{
  "success": true,
  "count": 3
}
```

#### POST /api/online
更新心跳

**请求**
```json
{
  "userId": "user_123456"
}
```

---

### 5. 定时任务

#### GET /api/cron/check-earnings
检查新公告（每5分钟）

**功能**
1. 获取最新数据
2. 对比已发送记录
3. 发现新公告发送邮件
4. 更新已发送记录

#### GET /api/cron/daily-summary
每日汇总（每天00:00）

**功能**
1. 统计当日新增
2. 发送汇总邮件

---

## 环境配置

### 环境变量清单

```bash
# ============================================
# Upstash Redis 配置（必需）
# ============================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# ============================================
# 邮件服务配置（可选，用于发送通知）
# ============================================

# SMTP 服务器配置
SMTP_HOST=smtp.qq.com              # QQ邮箱
# SMTP_HOST=smtp.163.com           # 163邮箱
# SMTP_HOST=smtp.gmail.com         # Gmail

SMTP_PORT=465                      # SSL端口
# SMTP_PORT=587                    # TLS端口

SMTP_USER=your-email@qq.com        # 发件邮箱
SMTP_PASS=your-smtp-auth-code      # SMTP授权码（不是密码）
EMAIL_FROM=your-email@qq.com       # 发件人邮箱

# ============================================
# Cron 安全密钥（可选）
# ============================================
CRON_SECRET=your-random-secret-string

# ============================================
# 其他配置
# ============================================
NODE_ENV=production                # 环境：development | production
```

### 获取 SMTP 授权码

#### QQ 邮箱
1. 登录 QQ 邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启 POP3/SMTP 服务
4. 生成授权码
5. 使用授权码作为 `SMTP_PASS`

#### 163 邮箱
1. 登录 163 邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启 SMTP 服务
4. 设置客户端授权密码
5. 使用授权密码作为 `SMTP_PASS`

#### Gmail
1. 开启两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `SMTP_PASS`

---

## 部署流程

### 方式一：Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 添加环境变量
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

### 方式二：GitHub 自动部署

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 在 Vercel Dashboard 导入仓库
# 3. 配置环境变量
# 4. 点击 Deploy
```

### 部署后验证

```bash
# 测试 API
curl https://your-app.vercel.app/api/emails
curl https://your-app.vercel.app/api/earnings?type=today

# 访问管理后台
https://your-app.vercel.app/admin
```

---

## 开发指南

### 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd earnings-tracker

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入配置

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
http://localhost:3000
```

### 测试命令

```bash
# 测试 Upstash 连接
npm run test:upstash

# 验证存储功能
npm run verify:storage

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### 代码规范

**TypeScript**
- 使用严格模式
- 定义接口类型
- 避免 `any` 类型

**React**
- 使用函数组件
- 使用 Hooks
- 遵循单一职责原则

**样式**
- 使用 Tailwind CSS
- 响应式设计
- 暗色模式支持

---

## 核心代码模块

### 1. 数据获取 (`lib/eastmoney.ts`)

```typescript
/**
 * 从东方财富获取业绩预告数据
 */
export async function fetchEarningsReports(): Promise<EarningsReport[]>

/**
 * 获取最近7天的报告
 */
export function getLatestReports(reports: EarningsReport[]): Map<string, EarningsReport[]>

/**
 * 格式化邮件内容
 */
export function formatEmailContent(stocks: Map<string, EarningsReport[]>): string
```

### 2. 邮件服务 (`lib/email.ts`)

```typescript
/**
 * 发送邮件
 */
export async function sendEmail(to: string[], subject: string, html: string): Promise<boolean>

/**
 * 发送即时通知
 */
export async function sendInstantNotification(stocks: Map<string, EarningsReport[]>): Promise<void>

/**
 * 发送每日汇总
 */
export async function sendDailySummary(): Promise<void>
```

### 3. 数据存储 (`lib/storage.ts`)

```typescript
/**
 * 通用读写
 */
export async function getValue<T>(key: string): Promise<T | null>
export async function setValue(key: string, value: any, expirySeconds?: number): Promise<void>

/**
 * 邮件管理
 */
export async function getEmailList(): Promise<string[]>
export async function addEmail(email: string): Promise<void>
export async function removeEmail(email: string): Promise<void>

/**
 * 股票数据
 */
export async function getAllStocks(): Promise<Stock[]>
export async function saveAllStocks(stocks: Stock[]): Promise<void>
export async function getCachedStocks(): Promise<Stock[] | null>
export async function cacheStocks(stocks: Stock[]): Promise<void>

/**
 * 发送记录
 */
export async function getSentStocks(): Promise<Set<string>>
export async function addSentStock(stockCode: string): Promise<void>
export async function getEmailHistory(): Promise<EmailHistory[]>
export async function addEmailHistory(history: EmailHistory): Promise<void>
```

---

## 常见问题

### 1. Upstash 连接失败
**症状**：日志显示 "using memory storage"

**解决**：
- 检查环境变量是否正确
- 确认 Upstash 数据库状态为 Active
- 检查网络连接

### 2. 邮件发送失败
**症状**：邮件未收到

**解决**：
- 检查 SMTP 配置
- 确认使用授权码而非密码
- 检查邮箱是否在垃圾箱
- 查看 Function Logs

### 3. Cron 任务不执行
**症状**：没有自动检查新公告

**解决**：
- 检查 `vercel.json` 配置
- 确认 Vercel 项目已部署
- 在 Vercel Dashboard 查看 Cron Jobs 状态

### 4. 数据显示为空
**症状**：Admin 界面显示 0

**解决**：
- 点击"初始化数据"按钮
- 检查 API 响应
- 查看浏览器控制台错误

---

## 性能优化

### 1. 缓存策略
- 股票数据缓存 5 分钟
- 在线用户数据缓存 60 秒
- 使用 Redis TTL 自动过期

### 2. 请求优化
- 批量获取数据
- 减少 API 调用频率
- 使用心跳机制

### 3. 前端优化
- 懒加载组件
- 防抖/节流
- 响应式图片

---

## 扩展功能建议

### 短期优化
- [ ] 添加微信通知
- [ ] 支持自定义筛选条件
- [ ] 添加股票收藏功能
- [ ] 优化邮件模板

### 中期规划
- [ ] 添加用户登录系统
- [ ] 支持多种通知方式
- [ ] 数据可视化图表
- [ ] 移动端 App

### 长期愿景
- [ ] AI 智能推荐
- [ ] 社区功能
- [ ] 付费订阅
- [ ] 开放 API

---

## 许可证

MIT License

---

## 联系方式

- GitHub: [geooooooorge/yjyg](https://github.com/geooooooorge/yjyg)
- 项目文档：查看 `/docs` 目录

---

**最后更新：2025-10-28**
