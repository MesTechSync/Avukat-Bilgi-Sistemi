param(
  [int]$BackendPort = 9001,
  [int]$FrontendPort = 5175
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $here

Write-Host "Killing existing servers on ports $BackendPort/9000 and $FrontendPort if any..." -ForegroundColor Yellow
function Stop-Port($port) {
  $lines = netstat -ano | Select-String ":$port" | ForEach-Object { $_.ToString() }
  foreach ($line in $lines) {
    $parts = $line -split "\s+"
    if ($parts.Length -ge 5) {
      $procId = $parts[-1]
      if ($procId -match '^[0-9]+$') {
        try { Stop-Process -Id [int]$procId -Force -ErrorAction SilentlyContinue } catch {}
      }
    }
  }
}
Stop-Port 9000
Stop-Port $BackendPort
Stop-Port $FrontendPort

Write-Host "Ensuring Python dependencies (pip install -r requirements.txt)" -ForegroundColor Cyan
if (Test-Path ..\.venv\Scripts\python.exe) {
  & ..\.venv\Scripts\python.exe -m pip install -r requirements.txt | Write-Host
} else {
  python -m pip install -r requirements.txt | Write-Host
}

Write-Host ("Starting backend on port " + $BackendPort + " (no reload)") -ForegroundColor Green
$backendLog = Join-Path $here 'panel_backend.log'
$backendErrLog = Join-Path $here 'panel_backend.err.log'
Remove-Item $backendLog -ErrorAction SilentlyContinue
Remove-Item $backendErrLog -ErrorAction SilentlyContinue
if (Test-Path ..\.venv\Scripts\python.exe) {
  Start-Process -FilePath "..\\.venv\\Scripts\\python.exe" -ArgumentList "backend.py" -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrLog -WorkingDirectory $here -WindowStyle Hidden
} else {
  Start-Process -FilePath "python" -ArgumentList "backend.py" -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrLog -WorkingDirectory $here -WindowStyle Hidden
}

Start-Sleep -Seconds 2
try {
  $resp = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$BackendPort/health/production" -TimeoutSec 5
  Write-Host ("Backend is up (" + $resp.StatusCode + ") at http://127.0.0.1:" + $BackendPort) -ForegroundColor Green
} catch {
  Write-Host ("Backend not responding yet; check " + $backendLog + " and " + $backendErrLog) -ForegroundColor Yellow
}

Write-Host "Ensuring npm dependencies" -ForegroundColor Cyan
if (-not (Test-Path node_modules)) {
  if (Test-Path package-lock.json) { npm ci } else { npm install }
}

Write-Host ("Starting Vite dev server on port " + $FrontendPort + " (proxy to " + $BackendPort + ")") -ForegroundColor Green
$env:VITE_BACKEND_URL = "http://127.0.0.1:$BackendPort"
Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--", "--host", "0.0.0.0", "--port", "$FrontendPort", "--strictPort" -WorkingDirectory $here -WindowStyle Hidden

Write-Host "Tail logs with:" -ForegroundColor Yellow
Write-Host ("  Get-Content -Path '" + $backendLog + "' -Wait") -ForegroundColor Gray
Write-Host ("  Get-Content -Path '" + $backendErrLog + "' -Wait") -ForegroundColor Gray
Write-Host ("Done. Frontend: http://127.0.0.1:" + $FrontendPort + " | Backend: http://127.0.0.1:" + $BackendPort) -ForegroundColor Green
