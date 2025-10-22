@echo off
echo ===================================
echo 提交并推送代码到 GitHub
echo ===================================
echo.

git add .
git commit -m "Add quarterly grouping and announcement links"
git push origin main

echo.
echo ===================================
echo 完成！
echo ===================================
pause
