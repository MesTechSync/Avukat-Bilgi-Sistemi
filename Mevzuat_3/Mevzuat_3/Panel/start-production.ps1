# Ensures UTF-8 console and starts production backend serving built frontend
param(
  [int]$Port = 9001,
  [int]$Workers = 1,
  [switch]$Public
)

$ErrorActionPreference = 'Stop'

Write-Host "Building frontend (vite build)"
if (-not (Test-Path package.json)) { throw "Run from Panel directory" }

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm is required to build the frontend"
}

# Set UTF-8 output
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

Write-Host "Killing any process on port $Port"
try {
  $pids = (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
  foreach ($pid in $pids) { if ($pid) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }
} catch {}

npm run build | Write-Output

$python = Join-Path (Split-Path (Split-Path $PSScriptRoot)) '.venv\Scripts\python.exe'
if (-not (Test-Path $python)) { $python = 'python' }

$logDir = $PSScriptRoot
$outLog = Join-Path $logDir 'panel_backend.prod.log'
$errLog = Join-Path $logDir 'panel_backend.prod.err.log'

$hostBind = if ($Public) { '0.0.0.0' } else { '127.0.0.1' }

if ($Public) {
  Write-Host "Public mode: attempting to add firewall rule for port $Port"
  try {
    if (-not (Get-Command New-NetFirewallRule -ErrorAction SilentlyContinue)) {
      Write-Warning "NetSecurity module unavailable; skipping firewall rule"
    } else {
      New-NetFirewallRule -DisplayName "Panel Backend $Port" -Direction Inbound -LocalPort $Port -Protocol TCP -Action Allow -Profile Any -ErrorAction SilentlyContinue | Out-Null
    }
  } catch { Write-Warning "Firewall rule add failed: $($_.Exception.Message)" }
}

Write-Host ("Starting uvicorn on {0}:{1} (workers={2})" -f $hostBind, $Port, $Workers)
$args = @('-m','uvicorn','panel_backend_production:app','--host', $hostBind, '--port', "$Port", '--workers', "$Workers")
$proc = Start-Process -FilePath $python -ArgumentList $args -PassThru -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WorkingDirectory $PSScriptRoot
Write-Host "Started Uvicorn PID $($proc.Id). Logs: $outLog | $errLog"
Write-Host "Tail logs with:`n  Get-Content -Path '$outLog' -Wait`n  Get-Content -Path '$errLog' -Wait"