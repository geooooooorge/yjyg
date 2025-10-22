// 测试邮件发送
const fetch = require('node-fetch');

const testSendEmail = async () => {
  console.log('=== 测试邮件发送 ===\n');
  
  try {
    console.log('发送测试邮件请求...');
    const res = await fetch('http://localhost:3000/api/test-email');
    const text = await res.text();
    
    console.log('状态码:', res.status);
    console.log('响应:', text);
    
    if (res.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ 成功!');
      console.log('详情:', data);
    } else {
      console.log('\n❌ 失败!');
      try {
        const error = JSON.parse(text);
        console.log('错误:', error);
      } catch (e) {
        console.log('原始响应:', text);
      }
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
};

testSendEmail();
