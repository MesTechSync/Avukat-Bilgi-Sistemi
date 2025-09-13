param(
  [int]$Port = 5175
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $here
if (-not (Test-Path node_modules)) {
  Write-Host 'Installing npm dependencies (npm ci)...' -ForegroundColor Cyan
  npm ci
}
Write-Host "Starting Vite dev server on port $Port..." -ForegroundColor Green
npm run dev -- --host 0.0.0.0 --port $Port --strictPort