# Git初始化和推送脚本

Write-Host "=== 初始化Git仓库 ===" -ForegroundColor Green

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 业绩预增跟踪器"

Write-Host "`n=== Git仓库初始化完成 ===" -ForegroundColor Green
Write-Host "`n下一步操作：" -ForegroundColor Yellow
Write-Host "1. 在GitHub创建新仓库" -ForegroundColor Cyan
Write-Host "2. 运行以下命令推送代码：" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/你的用户名/earnings-tracker.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host "`n3. 然后在Vercel导入GitHub仓库进行部署" -ForegroundColor Cyan
