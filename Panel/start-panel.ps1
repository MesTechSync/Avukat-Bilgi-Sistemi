param(
  [int]$Port = 5175
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $here

Write-Host "🏗️ Panel İçtihat & Mevzuat Sistemi Başlatılıyor..." -ForegroundColor Green
Write-Host "🔧 Architecture: Opus-recommended Enterprise Pattern" -ForegroundColor Yellow

# Backend'i arka planda başlat
Write-Host "🚀 Backend başlatılıyor (Port 9000)..." -ForegroundColor Cyan
Start-Process -WindowStyle Hidden -FilePath "python" -ArgumentList "panel_backend.py"
Start-Sleep -Seconds 2

if (-not (Test-Path node_modules)) {
  if (Test-Path package-lock.json) {
    Write-Host 'Installing npm dependencies (npm ci)...' -ForegroundColor Cyan
    npm ci
  } else {
    Write-Host 'Installing npm dependencies (npm install)...' -ForegroundColor Cyan
    npm install
  }
}
Write-Host "Starting Vite dev server on port $Port..." -ForegroundColor Green
npm run dev -- --host 0.0.0.0 --port $Port --strictPort