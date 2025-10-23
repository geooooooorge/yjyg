# Test settings API
Write-Host "Testing GET /api/settings..." -ForegroundColor Cyan
$getResult = Invoke-WebRequest -Uri http://localhost:3000/api/settings -Method GET
Write-Host "GET Response:" -ForegroundColor Green
$getResult.Content
Write-Host ""

Write-Host "Testing POST /api/settings with frequency=60..." -ForegroundColor Cyan
$body = @{
    notificationFrequency = 60
} | ConvertTo-Json

$postResult = Invoke-WebRequest -Uri http://localhost:3000/api/settings -Method POST -Body $body -ContentType "application/json"
Write-Host "POST Response:" -ForegroundColor Green
$postResult.Content
Write-Host ""

Write-Host "Testing GET /api/settings again..." -ForegroundColor Cyan
$getResult2 = Invoke-WebRequest -Uri http://localhost:3000/api/settings -Method GET
Write-Host "GET Response after update:" -ForegroundColor Green
$getResult2.Content
