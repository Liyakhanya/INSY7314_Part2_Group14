Write-Host "🏦 INTERNATIONAL BANKING SYSTEM - DOCKER STARTUP" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

Write-Host "`n🔨 Building and starting all services..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "`n⏳ Waiting for services to initialize..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    Write-Host "   Waiting... $i/3" -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

Write-Host "`n📊 SERVICE STATUS:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🎯 APPLICATION ACCESS POINTS:" -ForegroundColor Green
Write-Host "  💼 Customer Portal: https://localhost:5173" -ForegroundColor White
Write-Host "  👥 Employee Portal: https://localhost:3002" -ForegroundColor White
Write-Host "  🔧 Backend API:     https://localhost:3000/health" -ForegroundColor White

Write-Host "`n✅ SYSTEM STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "All services are running in Docker containers with SSL encryption." -ForegroundColor Cyan