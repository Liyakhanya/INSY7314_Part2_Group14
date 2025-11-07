Write-Host "🛑 STOPPING INTERNATIONAL BANKING SYSTEM" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

Write-Host "`nStopping all Docker services..." -ForegroundColor Gray
docker-compose down

Write-Host "`n✅ All services stopped successfully!" -ForegroundColor Green