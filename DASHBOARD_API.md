# Dashboard Data API 文档

## 概述

`/api/dashboard-data` 是一个 API 端点，用于获取页面前端显示的核心信息。这个 API 整合了股票数据和 AI 评论，方便在其他应用中加载和使用这些信息。

## API 端点

```
GET /api/dashboard-data
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "timestamp": "2024-12-08T06:26:00.000Z",
  "data": {
    "stocks": {
      "type": "today",  // 或 "recent"
      "count": 10,
      "list": [
        {
          "stockCode": "000001",
          "stockName": "平安银行",
          "reports": [
            {
              "quarter": "2025-09-30",
              "forecastType": "预增",
              "changeMin": 50,
              "changeMax": 100,
              "reportDate": "2024-12-08",
              "predictValue": 1000000000,
              "lastYearValue": 500000000,
              "changeYoY": 75.5,
              "changeQoQ": 20.3,
              "changeReason": "主营业务增长",
              "priceChange": 5.2,
              "currentPrice": 12.5
            }
          ]
        }
      ]
    },
    "aiComments": {
      "000001": "该股业绩预增幅度较大，值得关注...",
      "000002": "业绩增长稳定，建议持续跟踪..."
    }
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "Failed to fetch dashboard data",
  "timestamp": "2024-12-08T06:26:00.000Z"
}
```

## 数据字段说明

### stocks 对象

- **type**: 股票数据类型
  - `"today"`: 今日新增的股票
  - `"recent"`: 近7天的股票数据
- **count**: 股票数量
- **list**: 股票列表数组

### 股票对象字段

- **stockCode**: 股票代码
- **stockName**: 股票名称
- **reports**: 业绩报告数组

### 报告对象字段

- **quarter**: 报告季度 (格式: YYYY-MM-DD)
- **forecastType**: 预测类型 (如: "预增", "扭亏")
- **changeMin**: 最小变动百分比
- **changeMax**: 最大变动百分比
- **reportDate**: 报告发布日期
- **predictValue**: 预测值 (单位: 元)
- **lastYearValue**: 去年同期值 (单位: 元)
- **changeYoY**: 同比变化百分比
- **changeQoQ**: 环比变化百分比
- **changeReason**: 业绩变动原因
- **priceChange**: 股价变动百分比
- **currentPrice**: 当前股价

### aiComments 对象

- 键: 股票代码
- 值: AI 生成的评论文本

## 使用示例

### JavaScript/Node.js

```javascript
async function fetchDashboardData() {
  try {
    const response = await fetch('https://your-domain.com/api/dashboard-data');
    const data = await response.json();
    
    if (data.success) {
      console.log('股票数量:', data.data.stocks.count);
      console.log('AI 评论数量:', Object.keys(data.data.aiComments).length);
      
      // 遍历股票列表
      data.data.stocks.list.forEach(stock => {
        console.log(`${stock.stockName} (${stock.stockCode})`);
        console.log(`AI 评论: ${data.data.aiComments[stock.stockCode] || '暂无'}`);
      });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}
```

### Python

```python
import requests

def fetch_dashboard_data():
    try:
        response = requests.get('https://your-domain.com/api/dashboard-data')
        data = response.json()
        
        if data['success']:
            print(f"股票数量: {data['data']['stocks']['count']}")
            print(f"AI 评论数量: {len(data['data']['aiComments'])}")
            
            # 遍历股票列表
            for stock in data['data']['stocks']['list']:
                print(f"{stock['stockName']} ({stock['stockCode']})")
                ai_comment = data['data']['aiComments'].get(stock['stockCode'], '暂无')
                print(f"AI 评论: {ai_comment}")
    except Exception as e:
        print(f"获取数据失败: {e}")
```

### cURL

```bash
curl -X GET https://your-domain.com/api/dashboard-data
```

## 测试

运行测试脚本验证 API 功能：

```bash
node test-dashboard-api.js
```

## 注意事项

1. **缓存**: API 使用 `force-dynamic` 配置，确保每次请求都返回最新数据
2. **性能**: 该 API 整合了股票数据和 AI 评论，响应时间较快
3. **数据更新**: 股票数据每5分钟自动更新一次
4. **跨域**: 如需在其他域名使用，请配置 CORS

## 集成建议

### 在其他应用中使用

1. **定时轮询**: 建议每30-60秒轮询一次以获取最新数据
2. **错误处理**: 实现重试机制和降级策略
3. **数据缓存**: 在客户端缓存数据以减少请求频率
4. **增量更新**: 比较 timestamp 字段判断数据是否更新

### 示例：React Hook

```javascript
import { useState, useEffect } from 'react';

function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard-data');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟更新

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
```

## 更新日志

- **2024-12-08**: 初始版本发布
  - 整合股票数据和 AI 评论
  - 支持今日新增和近7天数据
  - 添加时间戳字段
