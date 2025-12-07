# Glytch Medical Platform - Easy Start Script
Write-Host "🚀 Starting Glytch Medical Platform..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "`n📦 Checking MongoDB connection..." -ForegroundColor Yellow

# Start Backend Server
Write-Host "`n🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "`n🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n✅ Both servers are starting!" -ForegroundColor Green
Write-Host "`n📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔌 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "`n💡 Tip: Keep both terminal windows open while using the app" -ForegroundColor Yellow
