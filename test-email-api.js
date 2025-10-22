// 测试邮箱API
const testEmail = async () => {
  console.log('=== 测试邮箱API ===\n');
  
  // 1. 获取当前邮箱列表
  console.log('1. 获取邮箱列表...');
  let res = await fetch('http://localhost:3000/api/emails');
  let data = await res.json();
  console.log('结果:', data);
  console.log('');
  
  // 2. 添加测试邮箱
  console.log('2. 添加测试邮箱...');
  res = await fetch('http://localhost:3000/api/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });
  data = await res.json();
  console.log('结果:', data);
  console.log('');
  
  // 3. 再次获取邮箱列表
  console.log('3. 再次获取邮箱列表...');
  res = await fetch('http://localhost:3000/api/emails');
  data = await res.json();
  console.log('结果:', data);
  console.log('');
  
  // 4. 添加你的邮箱
  console.log('4. 添加你的QQ邮箱...');
  res = await fetch('http://localhost:3000/api/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '1445173369@qq.com' })
  });
  data = await res.json();
  console.log('结果:', data);
  console.log('');
  
  // 5. 最终邮箱列表
  console.log('5. 最终邮箱列表...');
  res = await fetch('http://localhost:3000/api/emails');
  data = await res.json();
  console.log('结果:', data);
};

testEmail().catch(console.error);
