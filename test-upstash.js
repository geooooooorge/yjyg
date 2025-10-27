/**
 * Upstash Redis 连接测试脚本
 * 运行: node test-upstash.js
 */

require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

async function testUpstashConnection() {
  console.log('🔍 开始测试 Upstash Redis 连接...\n');

  // 检查环境变量
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ 错误：未找到 Upstash 环境变量！');
    console.log('\n请确保 .env.local 文件中包含：');
    console.log('  UPSTASH_REDIS_REST_URL=...');
    console.log('  UPSTASH_REDIS_REST_TOKEN=...\n');
    process.exit(1);
  }

  console.log('✓ 环境变量已配置');
  console.log(`  URL: ${url.substring(0, 30)}...`);
  console.log(`  Token: ${token.substring(0, 20)}...\n`);

  try {
    // 初始化 Redis 客户端
    const redis = new Redis({
      url: url,
      token: token,
    });

    console.log('📡 正在连接 Upstash Redis...');

    // 测试 1: PING
    const pingResult = await redis.ping();
    console.log(`✓ PING 测试: ${pingResult}\n`);

    // 测试 2: 写入数据
    const testKey = 'test_connection_' + Date.now();
    const testValue = { message: 'Hello Upstash!', timestamp: new Date().toISOString() };
    
    console.log('📝 测试写入数据...');
    await redis.set(testKey, testValue);
    console.log(`✓ 成功写入 key: ${testKey}\n`);

    // 测试 3: 读取数据
    console.log('📖 测试读取数据...');
    const readValue = await redis.get(testKey);
    console.log('✓ 成功读取数据:');
    console.log(JSON.stringify(readValue, null, 2));
    console.log();

    // 测试 4: 删除数据
    console.log('🗑️  清理测试数据...');
    await redis.del(testKey);
    console.log(`✓ 已删除 key: ${testKey}\n`);

    // 测试 5: 查看所有 keys
    console.log('🔑 查看数据库中的所有 keys:');
    const keys = await redis.keys('*');
    if (keys.length === 0) {
      console.log('  (数据库为空)\n');
    } else {
      console.log(`  共找到 ${keys.length} 个 keys:`);
      keys.slice(0, 10).forEach(key => console.log(`    - ${key}`));
      if (keys.length > 10) {
        console.log(`    ... 还有 ${keys.length - 10} 个\n`);
      } else {
        console.log();
      }
    }

    console.log('✅ 所有测试通过！Upstash Redis 连接正常！\n');
    console.log('💡 提示：');
    console.log('  - 你可以在 https://console.upstash.com/ 查看数据');
    console.log('  - 使用 Data Browser 或 CLI 查看存储的内容');
    console.log('  - 现在可以运行 npm run dev 启动应用了\n');

  } catch (error) {
    console.error('\n❌ 连接失败！');
    console.error('错误信息:', error.message);
    console.log('\n请检查：');
    console.log('  1. Upstash Redis URL 和 Token 是否正确');
    console.log('  2. 网络连接是否正常');
    console.log('  3. Upstash 数据库是否已创建并处于活动状态\n');
    process.exit(1);
  }
}

// 运行测试
testUpstashConnection();
