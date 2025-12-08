/**
 * 测试 Dashboard Data API
 * 用于验证 /api/dashboard-data 端点是否正常工作
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testDashboardApi() {
  console.log('🧪 测试 Dashboard Data API...\n');
  
  try {
    const response = await fetch(`${API_URL}/api/dashboard-data`);
    const data = await response.json();
    
    console.log('✅ API 响应成功');
    console.log('📊 响应数据结构:');
    console.log(JSON.stringify(data, null, 2));
    
    // 验证数据结构
    if (data.success) {
      console.log('\n✅ 数据验证:');
      console.log(`  - 股票类型: ${data.data.stocks.type}`);
      console.log(`  - 股票数量: ${data.data.stocks.count}`);
      console.log(`  - AI 评论数量: ${Object.keys(data.data.aiComments).length}`);
      console.log(`  - 时间戳: ${data.timestamp}`);
      
      // 显示前3只股票
      if (data.data.stocks.list.length > 0) {
        console.log('\n📈 前3只股票:');
        data.data.stocks.list.slice(0, 3).forEach((stock, index) => {
          console.log(`  ${index + 1}. ${stock.stockName} (${stock.stockCode})`);
          if (stock.reports && stock.reports[0]) {
            const report = stock.reports[0];
            console.log(`     - 预测类型: ${report.forecastType}`);
            console.log(`     - 变动范围: ${report.changeMin}% ~ ${report.changeMax}%`);
          }
        });
      }
      
    } else {
      console.log('❌ API 返回失败:', data.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDashboardApi();
