@echo off
echo ========================================
echo   Upstash Redis 环境配置助手
echo ========================================
echo.

REM 检查 .env.local 是否已存在
if exist .env.local (
    echo [警告] .env.local 文件已存在！
    echo.
    set /p overwrite="是否要覆盖现有文件？(y/N): "
    if /i not "%overwrite%"=="y" (
        echo 操作已取消。
        pause
        exit /b
    )
)

REM 复制示例文件
echo [1/3] 正在复制 .env.example 到 .env.local...
copy .env.example .env.local >nul
echo ✓ 文件创建成功！
echo.

echo [2/3] 请按照以下步骤配置 Upstash Redis：
echo.
echo   1. 访问 https://console.upstash.com/
echo   2. 登录或注册账号（免费）
echo   3. 点击 "Create Database" 创建数据库
echo   4. 选择 Regional 类型和最近的区域
echo   5. 创建后，在数据库详情页找到 REST API 部分
echo   6. 复制 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
echo.
pause

echo.
echo [3/3] 现在请编辑 .env.local 文件：
echo.
echo   - 用记事本或 VS Code 打开 .env.local
echo   - 将从 Upstash 复制的值粘贴到对应位置
echo   - 保存文件
echo.
echo 完成后，运行以下命令启动开发服务器：
echo   npm run dev
echo.
echo 详细配置指南请查看：UPSTASH_SETUP.md
echo.
pause

REM 询问是否打开文件
set /p open="是否现在打开 .env.local 文件进行编辑？(Y/n): "
if /i not "%open%"=="n" (
    notepad .env.local
)

echo.
echo ========================================
echo   配置完成！祝使用愉快！
echo ========================================
pause
