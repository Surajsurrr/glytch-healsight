# Glytch Medical Platform - One-Click Setup Script
# Run this script to set up both backend and frontend

Write-Host "🏥 Glytch Medical Platform - Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js >= 18.0.0" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Step 1: Backend Setup" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# Backend setup
Set-Location -Path "backend"

if (Test-Path "node_modules") {
    Write-Host "📦 Backend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env file
if (Test-Path ".env") {
    Write-Host "✅ Backend .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Backend .env created from .env.example" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit backend/.env and set your MONGODB_URI" -ForegroundColor Yellow
}

Set-Location -Path ".."

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Step 2: Frontend Setup" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# Frontend setup
Set-Location -Path "frontend"

if (Test-Path "node_modules") {
    Write-Host "📦 Frontend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env file
if (Test-Path ".env") {
    Write-Host "✅ Frontend .env file already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Frontend .env created from .env.example" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure MongoDB:" -ForegroundColor White
Write-Host "   - Edit backend/.env" -ForegroundColor Gray
Write-Host "   - Set MONGODB_URI to your MongoDB connection string" -ForegroundColor Gray
Write-Host "   - For local: mongodb://localhost:27017/glytch-med" -ForegroundColor Gray
Write-Host "   - For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/glytch-med" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Backend (Terminal 1):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - Quick Start Guide: QUICK_START.md" -ForegroundColor Gray
Write-Host "   - Full Documentation: README.md" -ForegroundColor Gray
Write-Host "   - API Reference: API_SPEC.md" -ForegroundColor Gray
Write-Host "   - Project Summary: PROJECT_SUMMARY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Need help? Check QUICK_START.md for troubleshooting!" -ForegroundColor Cyan
Write-Host ""
