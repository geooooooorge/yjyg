# 🤖 AI 点评功能配置指南

## 功能说明

为每个业绩预增公告添加了 AI 智能点评功能，使用阿里千问 API 生成专业的投资分析建议。

---

## 🔧 配置步骤

### 1. 添加环境变量

在 `.env.local` 文件中添加：

```env
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
```

**注意**：
- 这个 API Key 已经在代码中配置
- 如需更换，请修改 `.env.local` 文件
- 部署到 Vercel 时，需要在 Vercel Dashboard 添加此环境变量

---

## 📱 使用方法

### 前端使用

1. **查看股票列表**
   - 打开首页，查看"今日新增"板块
   - 每个股票卡片底部有"🤖 获取 AI 点评"按钮

2. **获取 AI 点评**
   - 点击"🤖 获取 AI 点评"按钮
   - 等待几秒钟（显示"生成中..."）
   - AI 点评会自动显示在卡片中

3. **点评内容**
   - AI 会分析股票的业绩变动情况
   - 提供简洁的投资建议（50字以内）
   - 点评会被缓存，不会重复请求

---

## 🎨 界面变化

### 1. 邮箱订阅模块（已简化）

**之前**：
- 占据左侧一整列
- 较大的输入框和按钮
- 列表式显示邮箱

**现在**：
- 紧凑的单行设计
- 小巧的输入框和按钮
- 标签式显示邮箱（更节省空间）
- 悬停显示删除按钮

### 2. 股票卡片（新增 AI 点评）

**新增内容**：
- 每个股票卡片底部添加分隔线
- "🤖 获取 AI 点评"按钮
- AI 点评显示区域（紫色标签）

---

## 🔌 API 接口

### POST /api/ai-comment

**请求参数**：
```typescript
{
  stockName: string;    // 股票名称
  stockCode: string;    // 股票代码
  forecastType: string; // 预告类型（预增、略增等）
  changeMin: number;    // 变动幅度下限
  changeMax: number;    // 变动幅度上限
  quarter: string;      // 报告期
}
```

**响应数据**：
```typescript
{
  success: boolean;
  comment?: string;  // AI 生成的点评
  error?: string;    // 错误信息（如果失败）
}
```

---

## 🤖 阿里千问 API 说明

### API 端点
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 使用的模型
- **模型名称**：`qwen-turbo`
- **特点**：快速响应，适合实时场景
- **最大 tokens**：150
- **温度**：0.7（平衡创造性和准确性）

### 提示词模板
```
请对以下股票业绩预增公告进行简短点评（50字以内）：

股票名称：{stockName}（{stockCode}）
预告类型：{forecastType}
业绩变动：{changeMin}% ~ {changeMax}%
报告期：{quarter}

请从投资角度给出简洁的分析和建议。
```

---

## 💰 费用说明

### 阿里千问定价
- **qwen-turbo 模型**：约 ¥0.002/千tokens
- **单次点评消耗**：约 100-150 tokens
- **单次费用**：约 ¥0.0003（不到 0.001 元）

### 成本估算
| 使用量 | 费用 |
|--------|------|
| 100 次点评 | ¥0.03 |
| 1000 次点评 | ¥0.30 |
| 10000 次点评 | ¥3.00 |

**结论**：成本极低，可以放心使用！

---

## 🔒 安全建议

### 1. API Key 保护
- ✅ 已添加到 `.env.example`（示例）
- ✅ 不要提交真实 API Key 到 Git
- ✅ 使用环境变量管理

### 2. 错误处理
- ✅ API 调用失败时显示友好提示
- ✅ 10秒超时保护
- ✅ 前端缓存避免重复请求

### 3. 限流建议
- 考虑添加请求频率限制
- 避免恶意刷新导致费用增加
- 可以设置每日请求上限

---

## 🚀 部署到 Vercel

### 1. 添加环境变量

在 Vercel Dashboard：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加：
   - Name: `QWEN_API_KEY`
   - Value: `sk-fefa9fed5599445abd3532c3b8187488`
   - Environment: Production, Preview, Development

### 2. 重新部署

```bash
# 推送代码会自动触发部署
git push origin main

# 或使用 Vercel CLI
vercel --prod
```

---

## 🧪 测试

### 本地测试

1. **启动开发服务器**
```bash
npm run dev
```

2. **访问页面**
```
http://localhost:3000
```

3. **测试 AI 点评**
   - 查看股票列表
   - 点击"🤖 获取 AI 点评"
   - 查看生成的点评内容

### API 测试

```bash
# 使用 curl 测试
curl -X POST http://localhost:3000/api/ai-comment \
  -H "Content-Type: application/json" \
  -d '{
    "stockName": "瑞联新材",
    "stockCode": "688550",
    "forecastType": "预增",
    "changeMin": 59.26,
    "changeMax": 59.26,
    "quarter": "2025-09-30"
  }'
```

---

## 📊 功能优化建议

### 短期优化
- [ ] 添加点评缓存到 Redis（避免重复调用）
- [ ] 批量生成点评（一次性生成所有）
- [ ] 添加点评质量评分

### 中期优化
- [ ] 支持用户自定义提示词
- [ ] 添加多种 AI 模型选择
- [ ] 点评历史记录

### 长期优化
- [ ] AI 预测股价走势
- [ ] 生成详细分析报告
- [ ] 多维度评分系统

---

## ❓ 常见问题

### Q1: AI 点评生成失败怎么办？
**A**: 检查以下几点：
1. API Key 是否正确配置
2. 网络连接是否正常
3. 查看浏览器控制台错误信息
4. 查看 Vercel Function Logs

### Q2: 点评生成太慢？
**A**: 
- 正常响应时间：2-5秒
- 如果超过 10 秒会超时
- 可以考虑使用更快的模型

### Q3: 如何更换 AI 模型？
**A**: 修改 `app/api/ai-comment/route.ts`：
```typescript
model: 'qwen-plus',  // 更强大但稍慢
// 或
model: 'qwen-max',   // 最强但最慢
```

### Q4: 如何自定义提示词？
**A**: 修改 `app/api/ai-comment/route.ts` 中的 `prompt` 变量。

---

## 📝 更新日志

### v1.0.0 (2025-10-28)
- ✅ 初始版本
- ✅ 集成阿里千问 API
- ✅ 简化邮箱订阅 UI
- ✅ 添加 AI 点评按钮
- ✅ 点评缓存机制

---

**最后更新**：2025-10-28  
**维护者**：geooooooorge
