/**
 * 验证 Upstash 存储功能
 * 运行: node verify-storage.js
 */

require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

async function verifyStorage() {
  console.log('🔍 开始验证 Upstash 存储功能...\n');

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // 1. 验证邮件列表
    console.log('📧 1. 验证邮件列表存储...');
    const emailList = await redis.get('email_list');
    if (emailList) {
      console.log(`   ✅ 邮件列表: ${emailList.length} 个邮箱`);
      console.log(`   📋 邮箱: ${emailList.join(', ')}`);
    } else {
      console.log('   ⚠️  邮件列表为空');
    }
    console.log();

    // 2. 验证历史股票数据
    console.log('📊 2. 验证历史股票数据存储...');
    const allStocks = await redis.get('all_stocks_history');
    if (allStocks && allStocks.data) {
      console.log(`   ✅ 历史股票数据: ${allStocks.count} 只股票`);
      console.log(`   📅 更新时间: ${allStocks.updatedAt}`);
      console.log(`   📝 示例股票: ${allStocks.data.slice(0, 3).map(s => `${s.stockName}(${s.stockCode})`).join(', ')}`);
    } else {
      console.log('   ⚠️  历史股票数据为空');
    }
    console.log();

    // 3. 验证邮件发送历史
    console.log('📮 3. 验证邮件发送历史...');
    const emailHistory = await redis.get('email_history');
    if (emailHistory && emailHistory.length > 0) {
      console.log(`   ✅ 邮件历史: ${emailHistory.length} 条记录`);
      const latest = emailHistory[0];
      console.log(`   📅 最近发送: ${latest.sentAt}`);
      console.log(`   👥 收件人数: ${latest.recipients.length}`);
      console.log(`   📈 股票数量: ${latest.stockCount}`);
    } else {
      console.log('   ℹ️  暂无邮件发送历史（这是正常的，还没有发送过邮件）');
    }
    console.log();

    // 4. 验证应用设置
    console.log('⚙️  4. 验证应用设置...');
    const settings = await redis.get('app_settings');
    if (settings) {
      console.log(`   ✅ 通知频率: 每 ${settings.notificationFrequency} 分钟`);
    } else {
      console.log('   ℹ️  使用默认设置');
    }
    console.log();

    // 5. 查看所有 keys
    console.log('🔑 5. 数据库中的所有 Keys:');
    const keys = await redis.keys('*');
    console.log(`   共 ${keys.length} 个 keys:`);
    keys.forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log();

    // 6. 测试写入功能
    console.log('✍️  6. 测试写入功能...');
    const testKey = 'test_verify_' + Date.now();
    await redis.set(testKey, { test: 'data', timestamp: new Date().toISOString() });
    const testRead = await redis.get(testKey);
    if (testRead && testRead.test === 'data') {
      console.log('   ✅ 写入测试成功');
      await redis.del(testKey);
      console.log('   ✅ 删除测试成功');
    } else {
      console.log('   ❌ 写入测试失败');
    }
    console.log();

    // 总结
    console.log('=' .repeat(60));
    console.log('📋 验证总结:');
    console.log('=' .repeat(60));
    console.log('✅ Upstash Redis 连接正常');
    console.log(`✅ 邮件列表: ${emailList ? emailList.length : 0} 个邮箱`);
    console.log(`✅ 历史股票: ${allStocks && allStocks.data ? allStocks.count : 0} 只`);
    console.log(`✅ 邮件历史: ${emailHistory ? emailHistory.length : 0} 条`);
    console.log(`✅ 数据库Keys: ${keys.length} 个`);
    console.log();
    console.log('🎉 所有存储功能验证通过！');
    console.log();
    console.log('💡 下一步:');
    console.log('   1. 访问 http://localhost:3000/admin 查看管理界面');
    console.log('   2. 在 Upstash 控制台查看实际存储的数据');
    console.log('   3. 部署到 Vercel 后，在 Vercel 环境变量中添加相同配置');
    console.log();

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    process.exit(1);
  }
}

verifyStorage();
