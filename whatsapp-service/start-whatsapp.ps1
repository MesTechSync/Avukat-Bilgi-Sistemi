param(
  [int]$Port = 8020
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $here
if (-not (Test-Path node_modules)) {
  if (Test-Path package-lock.json) {
    Write-Host 'Installing WhatsApp service deps (npm ci)...' -ForegroundColor Cyan
    npm ci
  } else {
    Write-Host 'Installing WhatsApp service deps (npm install)...' -ForegroundColor Cyan
    npm install
  }
}
Write-Host "Starting WhatsApp service on port $Port..." -ForegroundColor Green
$env:PORT = $Port
npm start
