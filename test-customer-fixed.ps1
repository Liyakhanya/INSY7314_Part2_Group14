Write-Host "🚀 Testing Fixed Customer Portal Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check current directory and files
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor Yellow

# Verify directory structure
Write-Host "`n📁 Verifying directory structure..." -ForegroundColor Yellow
if (Test-Path "INSYPaymentPortal/frontend") {
    Write-Host "✅ INSYPaymentPortal/frontend found" -ForegroundColor Green
} else {
    Write-Host "❌ INSYPaymentPortal/frontend not found" -ForegroundColor Red
}

if (Test-Path "INSYPaymentPortal/frontend/Dockerfile") {
    Write-Host "✅ Dockerfile found in frontend" -ForegroundColor Green
} else {
    Write-Host "❌ Dockerfile not found in frontend" -ForegroundColor Red
}

# Check Docker services
Write-Host "`n📊 Checking services status..." -ForegroundColor Yellow
docker-compose ps

# Test backend
Write-Host "`n🔧 Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://localhost:3000/health" -SkipCertificateCheck
    Write-Host "✅ Backend API: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test customer portal
Write-Host "`n💼 Testing Customer Portal..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:5173" -SkipCertificateCheck -TimeoutSec 20
    Write-Host "✅ Customer Portal is running on https://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Customer Portal: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This might be normal if React is still starting up..." -ForegroundColor Gray
}

Write-Host "`n🎉 Fixed Setup Test Complete!" -ForegroundColor Green
Write-Host "Access: https://localhost:5173" -ForegroundColor Cyan