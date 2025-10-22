@echo off
echo ===================================
echo 推送代码到 GitHub
echo ===================================
echo.

REM 检查是否已有远程仓库
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo 添加远程仓库...
    git remote add origin https://github.com/geooooooorge/yjyg.git
)

REM 切换到 main 分支
echo 切换到 main 分支...
git branch -M main

REM 推送代码
echo 推送代码到 GitHub...
git push -u origin main

echo.
echo ===================================
echo 完成！
echo ===================================
echo.
echo 接下来请访问 https://vercel.com 部署项目
echo.
pause
