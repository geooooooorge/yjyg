# 🔧 技术栈速查表

## 📦 package.json 依赖清单

```json
{
  "name": "earnings-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:upstash": "node test-upstash.js",
    "verify:storage": "node verify-storage.js"
  },
  "dependencies": {
    "@upstash/redis": "^1.35.6",
    "axios": "^1.7.2",
    "lucide-react": "^0.400.0",
    "next": "14.2.5",
    "nodemailer": "^6.9.13",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/nodemailer": "^6.4.14",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## 🎨 Tailwind CSS 配置

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 常用 Tailwind 类

#### 布局
```css
/* 容器 */
container mx-auto px-4 py-8 max-w-6xl

/* Flexbox */
flex items-center justify-between gap-4
flex-col sm:flex-row

/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

#### 响应式
```css
/* 移动优先 */
text-sm sm:text-base md:text-lg lg:text-xl

/* 断点 */
sm:  640px   /* 小屏幕 */
md:  768px   /* 中等屏幕 */
lg:  1024px  /* 大屏幕 */
xl:  1280px  /* 超大屏幕 */
```

#### 颜色和样式
```css
/* 背景 */
bg-white dark:bg-gray-800
bg-gradient-to-br from-blue-50 to-indigo-100

/* 文字 */
text-gray-800 dark:text-white
font-bold font-semibold font-medium

/* 边框和圆角 */
border border-gray-200 dark:border-gray-700
rounded-lg rounded-xl rounded-full

/* 阴影 */
shadow-sm shadow-md shadow-lg
```

#### 交互
```css
/* 悬停 */
hover:bg-gray-100 hover:text-blue-600

/* 激活 */
active:bg-indigo-800

/* 过渡 */
transition-colors transition-all duration-200

/* 禁用 */
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## 🎭 Lucide React 图标

### 常用图标
```tsx
import { 
  Mail,           // 邮件
  Plus,           // 加号
  Trash2,         // 删除
  RefreshCw,      // 刷新
  TrendingUp,     // 趋势上升
  Bell,           // 铃铛
  Users,          // 用户
  Settings,       // 设置
  Download,       // 下载
  Upload,         // 上传
  Search,         // 搜索
  Filter,         // 过滤
  Check,          // 勾选
  X,              // 关闭
  ChevronDown,    // 下箭头
  ChevronUp,      // 上箭头
  ChevronLeft,    // 左箭头
  ChevronRight,   // 右箭头
  AlertCircle,    // 警告圆圈
  Info,           // 信息
  Home,           // 首页
  BarChart,       // 柱状图
  PieChart,       // 饼图
  Calendar,       // 日历
  Clock,          // 时钟
  Eye,            // 眼睛
  EyeOff,         // 眼睛关闭
  Lock,           // 锁
  Unlock,         // 解锁
} from 'lucide-react';

// 使用示例
<Mail className="w-5 h-5 text-indigo-600" />
<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
```

---

## 🗄️ Upstash Redis 命令

### 基础操作
```typescript
// 连接
const redis = Redis.fromEnv();

// 字符串操作
await redis.set('key', 'value');
await redis.get('key');
await redis.del('key');

// 带过期时间
await redis.set('key', 'value', { ex: 60 }); // 60秒后过期

// 数字操作
await redis.incr('counter');
await redis.decr('counter');

// 列表操作
await redis.lpush('list', 'item');
await redis.rpush('list', 'item');
await redis.lrange('list', 0, -1);

// 集合操作
await redis.sadd('set', 'member');
await redis.smembers('set');
await redis.srem('set', 'member');

// 哈希操作
await redis.hset('hash', 'field', 'value');
await redis.hget('hash', 'field');
await redis.hgetall('hash');

// 查询
await redis.keys('*');
await redis.exists('key');
await redis.ttl('key');
```

### 数据类型
```typescript
// 字符串
await redis.set('name', 'John');

// 数字
await redis.set('count', 42);

// JSON 对象
await redis.set('user', { id: 1, name: 'John' });

// 数组
await redis.set('items', ['a', 'b', 'c']);

// 带类型
await redis.get<string>('name');
await redis.get<number>('count');
await redis.get<User>('user');
```

---

## 📧 Nodemailer 配置

### SMTP 配置示例

#### QQ 邮箱
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your@qq.com',
    pass: 'authorization-code', // 授权码
  },
});
```

#### 163 邮箱
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your@163.com',
    pass: 'authorization-code',
  },
});
```

#### Gmail
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your@gmail.com',
    pass: 'app-password',
  },
});
```

### 发送邮件
```typescript
await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  // to: ['user1@example.com', 'user2@example.com'], // 多个收件人
  subject: '邮件主题',
  text: '纯文本内容',
  html: '<h1>HTML 内容</h1>',
  attachments: [
    {
      filename: 'file.pdf',
      path: '/path/to/file.pdf'
    }
  ]
});
```

---

## 🔄 Next.js API Routes

### 基础结构
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET 请求
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  return NextResponse.json({ 
    success: true, 
    data: { id } 
  });
}

// POST 请求
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({ 
    success: true, 
    data: body 
  });
}

// PUT 请求
export async function PUT(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({ 
    success: true, 
    updated: body 
  });
}

// DELETE 请求
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  
  return NextResponse.json({ 
    success: true, 
    deleted: id 
  });
}
```

### 错误处理
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 请求头
```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const userAgent = request.headers.get('user-agent');
  
  return NextResponse.json({ authHeader, userAgent });
}
```

### 响应头
```typescript
export async function GET() {
  return NextResponse.json(
    { data: 'value' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=60',
        'X-Custom-Header': 'value'
      }
    }
  );
}
```

---

## ⏰ Vercel Cron 表达式

### 常用表达式
```bash
# 格式: 分 时 日 月 周
# *    *  *  *  *

# 每分钟
* * * * *

# 每5分钟
*/5 * * * *

# 每15分钟
*/15 * * * *

# 每30分钟
*/30 * * * *

# 每小时
0 * * * *

# 每2小时
0 */2 * * *

# 每天00:00
0 0 * * *

# 每天08:00
0 8 * * *

# 每天12:00和18:00
0 12,18 * * *

# 工作日09:00
0 9 * * 1-5

# 每周一00:00
0 0 * * 1

# 每月1日00:00
0 0 1 * *

# 每季度第一天00:00
0 0 1 1,4,7,10 *
```

### vercel.json 配置
```json
{
  "crons": [
    {
      "path": "/api/cron/check-data",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## 🎨 CSS 动画

### Tailwind 动画
```css
/* 旋转 */
animate-spin

/* 脉冲 */
animate-pulse

/* 弹跳 */
animate-bounce

/* 自定义过渡 */
transition-all duration-200 ease-in-out
transition-colors duration-300
transition-transform duration-500
```

### 自定义动画
```css
/* tailwind.config.ts */
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in',
      'slide-up': 'slideUp 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
}
```

---

## 🔒 TypeScript 类型定义

### 常用接口
```typescript
// 用户
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

// API 响应
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 表单数据
interface FormData {
  [key: string]: string | number | boolean;
}

// 配置
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}
```

### 工具类型
```typescript
// 部分可选
Partial<User>

// 全部必需
Required<User>

// 只读
Readonly<User>

// 选择属性
Pick<User, 'id' | 'email'>

// 排除属性
Omit<User, 'password'>

// 记录类型
Record<string, any>

// 数组
Array<User>
User[]

// Promise
Promise<User>

// 联合类型
type Status = 'pending' | 'success' | 'error';

// 交叉类型
type UserWithRole = User & { role: string };
```

---

## 📱 响应式设计断点

### Tailwind 断点
```typescript
const breakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板
  lg: '1024px',  // 笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px' // 大屏
};
```

### 使用示例
```tsx
<div className="
  w-full           /* 默认：全宽 */
  sm:w-1/2         /* 小屏：半宽 */
  md:w-1/3         /* 中屏：1/3宽 */
  lg:w-1/4         /* 大屏：1/4宽 */
  
  text-sm          /* 默认：小字 */
  sm:text-base     /* 小屏：正常 */
  md:text-lg       /* 中屏：大字 */
  
  p-2              /* 默认：小内边距 */
  sm:p-4           /* 小屏：中内边距 */
  md:p-6           /* 中屏：大内边距 */
">
  响应式内容
</div>
```

---

## 🚀 性能优化技巧

### 1. 图片优化
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="描述"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### 2. 代码分割
```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### 3. 缓存策略
```typescript
// API 响应缓存
export const revalidate = 60; // 60秒

// 静态生成
export const dynamic = 'force-static';

// 动态渲染
export const dynamic = 'force-dynamic';
```

### 4. 防抖和节流
```typescript
// 防抖
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

---

## 🐛 调试技巧

### 1. 控制台日志
```typescript
console.log('普通日志');
console.info('信息日志');
console.warn('警告日志');
console.error('错误日志');
console.table([{ a: 1, b: 2 }]); // 表格显示
console.time('timer');
// ... 代码
console.timeEnd('timer'); // 显示耗时
```

### 2. 错误边界
```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 3. 环境变量检查
```typescript
if (!process.env.REQUIRED_VAR) {
  throw new Error('REQUIRED_VAR is not set');
}

console.log('Environment:', process.env.NODE_ENV);
console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL ? '✓' : '✗');
```

---

## 📚 常用命令

### npm/pnpm
```bash
# 安装依赖
npm install
pnpm install

# 添加依赖
npm install package-name
pnpm add package-name

# 添加开发依赖
npm install -D package-name
pnpm add -D package-name

# 更新依赖
npm update
pnpm update

# 清理缓存
npm cache clean --force
pnpm store prune
```

### Git
```bash
# 初始化
git init

# 添加文件
git add .
git add file.ts

# 提交
git commit -m "message"

# 推送
git push origin main

# 拉取
git pull origin main

# 查看状态
git status

# 查看日志
git log --oneline

# 创建分支
git checkout -b feature-name

# 切换分支
git checkout main

# 合并分支
git merge feature-name
```

### Vercel CLI
```bash
# 安装
npm i -g vercel

# 登录
vercel login

# 部署
vercel
vercel --prod

# 环境变量
vercel env add
vercel env ls
vercel env rm

# 查看日志
vercel logs
```

---

**最后更新：2025-10-28**
