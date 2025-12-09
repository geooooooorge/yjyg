# 设计系统文档

## 概述

本文档记录了业绩预增跟踪器的完整设计系统,遵循专业产品设计原则,确保界面的一致性、可访问性和用户体验。

---

## 设计原则

### 1. 以用户为中心
- **目标用户**: 投资者、分析师、财经从业者
- **使用场景**: 桌面办公、移动查看、快速浏览
- **核心目标**: 快速获取业绩预增信息,AI 辅助决策
- **成功标准**: 3秒内完成信息扫描,零学习成本

### 2. 信息架构
- **优先级排序**: AI 分析 → 股票信息 → 详细数据
- **渐进披露**: 核心信息优先,详细数据折叠
- **F型浏览**: 重要信息位于左上角
- **删减冗余**: 移除30%非必要元素

### 3. 视觉语言
- **色彩策略**: 60% 主色(蓝紫) / 30% 辅助色(中性灰) / 10% 强调色(成功/警告/错误)
- **字体配对**: 
  - 标题: Lexend (现代、易读)
  - 正文: Inter (专业、清晰)
- **间距体系**: 4/8/16/24/48/96 px
- **视觉层级**: 尺寸 > 粗细 > 颜色 > 对比度

### 4. 交互设计
- **完整状态覆盖**: 默认/悬停/聚焦/激活/加载/成功/错误/禁用/空状态
- **微交互**: 每个操作都有即时反馈
- **容错设计**: 输入验证、错误提示、操作确认

### 5. 动效设计
- **动效时长**:
  - 0-100ms: 瞬时反馈 (按钮点击)
  - 100-300ms: 功能切换 (标签切换)
  - 300-500ms: 模态出现 (弹窗、抽屉)
- **动效目的**:
  - 反馈类: 加载状态、操作确认
  - 关系类: 元素展开/收起
  - 引导类: 首次访问提示

### 6. 性能策略
- **骨架屏**: 优于 loading spinner
- **乐观 UI**: 立即响应用户操作
- **懒加载**: 图片和长列表
- **代码分割**: 按需加载组件

### 7. 可访问性
- **WCAG 2.1 AA**: 色彩对比度 ≥ 4.5:1
- **键盘导航**: 所有功能可用 Tab/Enter/Space 操作
- **屏幕阅读器**: ARIA 标签完整
- **减少动画**: 尊重 `prefers-reduced-motion`

### 8. 一致性系统
- **设计令牌**: 统一的颜色、间距、字体、动效
- **组件 API**: 相同的 props 命名和行为
- **UI 模式**: 相似功能使用相同交互
- **文案风格**: 简洁、友好、专业

---

## 设计令牌

### 颜色系统

#### 主色系 - 专业蓝紫
```css
primary-50:  #f5f7ff
primary-100: #ebf0ff
primary-200: #d6e0ff
primary-300: #b3c7ff
primary-400: #8ca3ff
primary-500: #6b7fff  /* 主色 */
primary-600: #5563ff
primary-700: #4148eb
primary-800: #363dbd
primary-900: #2e3595
```

#### 辅助色系 - 中性灰
```css
neutral-50:  #fafafa
neutral-100: #f5f5f5
neutral-200: #e5e5e5
neutral-300: #d4d4d4
neutral-400: #a3a3a3
neutral-500: #737373
neutral-600: #525252
neutral-700: #404040
neutral-800: #262626
neutral-900: #171717
```

#### 强调色系
```css
/* 成功 */
success-50:  #f0fdf4
success-500: #22c55e
success-600: #16a34a
success-700: #15803d

/* 警告 */
warning-50:  #fffbeb
warning-500: #f59e0b
warning-600: #d97706

/* 错误 */
error-50:  #fef2f2
error-500: #ef4444
error-600: #dc2626
```

### 间距体系
```css
spacing-xs:  4px   (0.25rem)
spacing-sm:  8px   (0.5rem)
spacing-md:  16px  (1rem)
spacing-lg:  24px  (1.5rem)
spacing-xl:  48px  (3rem)
spacing-2xl: 96px  (6rem)
```

### 字体配对
```css
font-display: 'Lexend', 'Inter', system-ui, sans-serif
font-sans:    'Inter', system-ui, -apple-system, sans-serif
```

### 圆角
```css
radius-sm:  6px   (0.375rem)
radius-md:  12px  (0.75rem)
radius-lg:  16px  (1rem)
radius-xl:  24px  (1.5rem)
```

### 阴影层级
```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
```

### 动效时长
```css
duration-instant: 50ms
duration-fast:    150ms
duration-normal:  250ms
duration-slow:    400ms
```

---

## 组件库

### Button 组件

**变体**:
- `primary`: 主要操作 (提交、确认)
- `secondary`: 次要操作 (取消、返回)
- `ghost`: 轻量操作 (刷新、更多)
- `danger`: 危险操作 (删除、清空)

**尺寸**:
- `sm`: 小按钮 (px-3 py-1.5)
- `md`: 中按钮 (px-4 py-2)
- `lg`: 大按钮 (px-6 py-3)

**状态**:
- 默认、悬停、聚焦、激活、加载、禁用

**示例**:
```tsx
<Button variant="primary" size="md" loading={false} icon={Plus}>
  添加
</Button>
```

### Card 组件

**变体**:
- 基础卡片
- 可悬停卡片 (`hover={true}`)

**内边距**:
- `none`: 无内边距
- `sm`: 小内边距 (p-3)
- `md`: 中内边距 (p-4 sm:p-6)
- `lg`: 大内边距 (p-6 sm:p-8)

**子组件**:
- `CardHeader`: 卡片头部 (标题、副标题、操作按钮)
- `CardContent`: 卡片内容

**示例**:
```tsx
<Card padding="md" hover>
  <CardHeader 
    title="标题" 
    subtitle="副标题"
    icon={<Icon />}
    action={<Button />}
  />
  <CardContent>
    内容
  </CardContent>
</Card>
```

### Input 组件

**功能**:
- 完整的表单验证
- 错误提示
- 辅助文本
- 图标支持

**状态**:
- 默认、聚焦、错误、禁用

**示例**:
```tsx
<Input
  label="邮箱地址"
  type="email"
  placeholder="输入邮箱"
  error={error}
  helperText="用于接收通知"
  icon={Mail}
  fullWidth
/>
```

### Badge 组件

**变体**:
- `default`: 默认样式
- `success`: 成功状态
- `warning`: 警告状态
- `error`: 错误状态
- `info`: 信息状态

**尺寸**:
- `sm`: 小徽章 (px-2 py-0.5 text-xs)
- `md`: 中徽章 (px-2.5 py-1 text-sm)

**示例**:
```tsx
<Badge variant="success" size="sm">
  预增
</Badge>
```

### Skeleton 组件

**变体**:
- `text`: 文本骨架
- `circular`: 圆形骨架
- `rectangular`: 矩形骨架

**专用骨架屏**:
- `StockCardSkeleton`: 股票卡片骨架屏

**示例**:
```tsx
{loading ? (
  <StockCardSkeleton />
) : (
  <StockCard data={stock} />
)}
```

---

## 页面结构

### 信息层级

1. **页头** (最高优先级)
   - Logo + 标题
   - 导航链接
   - 在线人数

2. **系统状态** (次高优先级)
   - AI API 状态
   - 全局消息提示

3. **邮件订阅** (中优先级)
   - 输入框 + 添加按钮
   - 已订阅列表

4. **股票列表** (核心内容)
   - 刷新按钮
   - 按季度分组
   - AI 分析优先显示
   - 股票详细信息

5. **页脚** (最低优先级)
   - 版权信息
   - 管理入口

### 响应式设计

**断点**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**移动优先**:
- 基础样式针对移动端
- 使用 `sm:` `md:` 等前缀适配大屏

---

## 最佳实践

### 1. 组件使用
```tsx
// ✅ 好的做法
<Button variant="primary" size="md" loading={isLoading}>
  提交
</Button>

// ❌ 避免
<button className="bg-blue-500 text-white px-4 py-2">
  提交
</button>
```

### 2. 颜色使用
```tsx
// ✅ 使用设计令牌
<div className="bg-primary-500 text-white">

// ❌ 使用硬编码颜色
<div className="bg-blue-600 text-white">
```

### 3. 间距使用
```tsx
// ✅ 使用间距体系
<div className="p-4 gap-2">

// ❌ 使用任意值
<div className="p-[13px] gap-[7px]">
```

### 4. 可访问性
```tsx
// ✅ 完整的 ARIA 标签
<button aria-label="删除邮箱" aria-busy={loading}>
  <Trash2 aria-hidden="true" />
</button>

// ❌ 缺少标签
<button>
  <Trash2 />
</button>
```

### 5. 性能优化
```tsx
// ✅ 使用骨架屏
{loading ? <Skeleton /> : <Content />}

// ❌ 使用 spinner
{loading && <Spinner />}
```

---

## 维护指南

### 添加新颜色
1. 在 `tailwind.config.ts` 中添加颜色定义
2. 在 `globals.css` 中添加 CSS 变量
3. 更新本文档

### 创建新组件
1. 在 `components/ui/` 创建组件文件
2. 遵循现有组件的 API 设计
3. 包含完整的交互状态
4. 添加 ARIA 标签
5. 在 `components/ui/index.ts` 导出
6. 更新本文档

### 修改设计令牌
1. 评估影响范围
2. 在 `tailwind.config.ts` 修改
3. 测试所有使用该令牌的组件
4. 更新本文档

---

## 参考资源

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 动效指南](https://material.io/design/motion)
- [Inclusive Components](https://inclusive-components.design/)

---

**最后更新**: 2024-12-09
**维护者**: AI 产品设计团队
