# 🚀 项目快速复用模板

## 📦 技术栈组合

### 核心框架
```json
{
  "frontend": "Next.js 14 + TypeScript + React 18",
  "styling": "Tailwind CSS",
  "icons": "Lucide React",
  "backend": "Next.js API Routes",
  "database": "Upstash Redis (Serverless)",
  "deployment": "Vercel",
  "email": "Nodemailer"
}
```

---

## 🎯 可复用的功能模块

### 1. 📧 邮件订阅系统

**适用场景**
- 新闻订阅
- 价格提醒
- 内容更新通知
- 活动通知

**核心代码**
```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

export async function sendEmail(to: string[], subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to.join(','),
    subject,
    html,
  });
}
```

**API 接口**
```typescript
// app/api/emails/route.ts
export async function GET() {
  const emails = await getEmailList();
  return NextResponse.json({ success: true, emails });
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  await addEmail(email);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { email } = await request.json();
  await removeEmail(email);
  return NextResponse.json({ success: true });
}
```

---

### 2. 💾 Upstash Redis 存储层

**适用场景**
- 用户数据存储
- 缓存系统
- 会话管理
- 实时数据

**核心代码**
```typescript
// lib/storage.ts
import { Redis } from '@upstash/redis';

const hasRedis = process.env.UPSTASH_REDIS_REST_URL && 
                process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
const memoryStore: Record<string, any> = {};

if (hasRedis) {
  redis = Redis.fromEnv();
}

export async function getValue<T>(key: string): Promise<T | null> {
  if (hasRedis && redis) {
    return await redis.get<T>(key);
  }
  return memoryStore[key] || null;
}

export async function setValue(
  key: string, 
  value: any, 
  expirySeconds?: number
): Promise<void> {
  if (hasRedis && redis) {
    if (expirySeconds) {
      await redis.set(key, value, { ex: expirySeconds });
    } else {
      await redis.set(key, value);
    }
  } else {
    memoryStore[key] = value;
  }
}
```

**环境变量**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

---

### 3. ⏰ Vercel Cron 定时任务

**适用场景**
- 数据同步
- 定时爬虫
- 定时通知
- 数据清理

**配置文件**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/task-name",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Cron 表达式**
```
*/5 * * * *    # 每5分钟
0 * * * *      # 每小时
0 0 * * *      # 每天00:00
0 8 * * *      # 每天08:00
0 0 * * 0      # 每周日00:00
0 0 1 * *      # 每月1日00:00
```

**API 实现**
```typescript
// app/api/cron/task-name/route.ts
export async function GET(request: NextRequest) {
  // 验证 Cron Secret（可选）
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 执行定时任务
  try {
    await performTask();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Task failed' }, { status: 500 });
  }
}
```

---

### 4. 👥 实时在线人数统计

**适用场景**
- 网站流量监控
- 用户活跃度统计
- 实时在线显示

**核心代码**
```typescript
// app/api/online/route.ts
const ONLINE_USERS_KEY = 'online_users';
const HEARTBEAT_TIMEOUT = 30000;

interface OnlineUser {
  id: string;
  lastSeen: number;
}

export async function GET() {
  const users = await getValue<OnlineUser[]>(ONLINE_USERS_KEY) || [];
  const now = Date.now();
  const activeUsers = users.filter(u => now - u.lastSeen < HEARTBEAT_TIMEOUT);
  
  if (activeUsers.length !== users.length) {
    await setValue(ONLINE_USERS_KEY, activeUsers);
  }
  
  return NextResponse.json({ success: true, count: activeUsers.length });
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  const users = await getValue<OnlineUser[]>(ONLINE_USERS_KEY) || [];
  const now = Date.now();
  
  const activeUsers = users.filter(u => now - u.lastSeen < HEARTBEAT_TIMEOUT);
  const existingIndex = activeUsers.findIndex(u => u.id === userId);
  
  if (existingIndex >= 0) {
    activeUsers[existingIndex].lastSeen = now;
  } else {
    activeUsers.push({ id: userId, lastSeen: now });
  }
  
  await setValue(ONLINE_USERS_KEY, activeUsers, 60);
  return NextResponse.json({ success: true, count: activeUsers.length });
}
```

**前端集成**
```typescript
const [onlineCount, setOnlineCount] = useState(0);
const [userId] = useState(() => `user_${Date.now()}_${Math.random()}`);

useEffect(() => {
  updateOnlineStatus();
  const heartbeat = setInterval(updateOnlineStatus, 15000);
  const refresh = setInterval(fetchOnlineCount, 10000);
  
  return () => {
    clearInterval(heartbeat);
    clearInterval(refresh);
  };
}, [userId]);

const updateOnlineStatus = async () => {
  const res = await fetch('/api/online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  if (data.success) setOnlineCount(data.count);
};
```

---

### 5. 🎨 响应式 UI 组件

**Tailwind 配置**
```typescript
// tailwind.config.ts
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    }
  }
}
```

**响应式卡片组件**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
    标题
  </h2>
  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
    内容
  </p>
</div>
```

**固定位置组件**
```tsx
<div className="fixed top-4 right-4 z-50">
  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg">
    <Users className="w-4 h-4 text-green-600" />
    <span className="text-sm font-medium">{count}</span>
  </div>
</div>
```

---

### 6. 🔐 环境变量管理

**本地开发**
```bash
# .env.local
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=xxx@qq.com
SMTP_PASS=xxx
```

**生产环境（Vercel）**
```bash
# 通过 Vercel Dashboard 添加
# Settings → Environment Variables

# 或使用 CLI
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

**代码中使用**
```typescript
const config = {
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
};
```

---

### 7. 📊 管理后台模板

**页面结构**
```tsx
export default function AdminPage() {
  const [stats, setStats] = useState({ emails: 0, items: 0, history: 0 });
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <h1>管理后台</h1>
      </header>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="项目1" value={stats.emails} />
        <StatCard title="项目2" value={stats.items} />
        <StatCard title="项目3" value={stats.history} />
      </div>
      
      {/* 标签页 */}
      <div className="tabs">
        <button onClick={() => setActiveTab('tab1')}>标签1</button>
        <button onClick={() => setActiveTab('tab2')}>标签2</button>
      </div>
      
      {/* 内容区 */}
      <div className="content">
        {activeTab === 'tab1' && <Tab1Content />}
        {activeTab === 'tab2' && <Tab2Content />}
      </div>
    </div>
  );
}
```

---

## 🛠️ 快速启动新项目

### 步骤 1：创建 Next.js 项目
```bash
npx create-next-app@latest my-project --typescript --tailwind --app
cd my-project
```

### 步骤 2：安装依赖
```bash
npm install @upstash/redis axios nodemailer lucide-react
npm install -D @types/nodemailer
```

### 步骤 3：复制核心文件
```bash
# 从本项目复制
cp lib/storage.ts ../my-project/lib/
cp lib/email.ts ../my-project/lib/
cp app/api/emails/route.ts ../my-project/app/api/emails/
```

### 步骤 4：配置环境变量
```bash
cp .env.example ../my-project/.env.local
# 编辑 .env.local 填入配置
```

### 步骤 5：启动开发
```bash
npm run dev
```

---

## 📝 项目检查清单

### 开发阶段
- [ ] 创建项目结构
- [ ] 配置 TypeScript
- [ ] 配置 Tailwind CSS
- [ ] 设置环境变量
- [ ] 实现核心功能
- [ ] 添加错误处理
- [ ] 编写 README

### 测试阶段
- [ ] 本地功能测试
- [ ] API 接口测试
- [ ] 数据库连接测试
- [ ] 邮件发送测试
- [ ] 响应式测试
- [ ] 暗色模式测试

### 部署阶段
- [ ] 推送代码到 GitHub
- [ ] 连接 Vercel
- [ ] 配置环境变量
- [ ] 配置 Cron Jobs
- [ ] 部署测试
- [ ] 域名绑定（可选）

### 上线后
- [ ] 监控日志
- [ ] 性能优化
- [ ] 用户反馈
- [ ] 功能迭代

---

## 🎯 不同场景的应用示例

### 场景 1：价格监控系统
```typescript
// 监控商品价格变化
interface PriceAlert {
  productId: string;
  targetPrice: number;
  currentPrice: number;
}

// Cron: 每小时检查价格
// 发现低于目标价格时发送邮件
```

### 场景 2：内容聚合平台
```typescript
// 聚合多个来源的内容
interface ContentSource {
  name: string;
  url: string;
  parser: (html: string) => Content[];
}

// Cron: 每30分钟抓取新内容
// 发现新内容时推送通知
```

### 场景 3：数据监控面板
```typescript
// 监控服务器状态
interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}

// 实时显示在线服务器数量
// 异常时发送告警邮件
```

### 场景 4：活动报名系统
```typescript
// 用户报名管理
interface Registration {
  email: string;
  name: string;
  phone: string;
  timestamp: number;
}

// 报名成功发送确认邮件
// 活动前一天发送提醒
```

---

## 💡 最佳实践

### 1. 错误处理
```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // 记录错误日志
  // 返回友好错误信息
  return { success: false, error: 'Operation failed' };
}
```

### 2. 数据验证
```typescript
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

if (!validateEmail(email)) {
  return { success: false, error: 'Invalid email' };
}
```

### 3. 缓存策略
```typescript
// 读取时先查缓存
const cached = await getCached(key);
if (cached) return cached;

// 缓存未命中，获取新数据
const fresh = await fetchFresh();
await setCache(key, fresh, 300); // 5分钟缓存
return fresh;
```

### 4. 日志记录
```typescript
console.log(`[${new Date().toISOString()}] Operation started`);
console.log(`✅ Success: ${result}`);
console.error(`❌ Error: ${error.message}`);
```

---

## 📚 相关资源

### 官方文档
- [Next.js](https://nextjs.org/docs)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Vercel](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nodemailer](https://nodemailer.com/)

### 工具网站
- [Cron 表达式生成器](https://crontab.guru/)
- [Tailwind 组件库](https://tailwindui.com/)
- [Lucide 图标库](https://lucide.dev/)

---

**最后更新：2025-10-28**
