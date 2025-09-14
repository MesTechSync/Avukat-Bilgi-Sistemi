param(
  [int]$Port = 8000,
  [string]$BindHost = '127.0.0.1',
  [Parameter(Position=2)][Alias('EnableVite')][object]$EnableViteParam = $false,
  [Parameter(Position=3)][Alias('OpenBrowser')][object]$OpenBrowserParam = $true,
  [switch]$Detach
)

$ErrorActionPreference = 'Stop'
Write-Host "[oneport] Starting setup..." -ForegroundColor Cyan

function Run-Cmd {
  param([string]$Cmd)
  & cmd /c $Cmd
}

function Convert-ToBool {
  param([Parameter(Mandatory=$false)]$Value)
  if ($null -eq $Value) { return $false }
  if ($Value -is [bool]) { return [bool]$Value }
  if ($Value -is [int]) { return [int]$Value -ne 0 }
  $s = ("$Value").ToLower().Trim()
  return @('1','true','t','yes','y','on').Contains($s)
}

${EnableVite} = Convert-ToBool $EnableViteParam
${OpenBrowser} = Convert-ToBool $OpenBrowserParam

Push-Location "$PSScriptRoot"

# 1) Install server deps
Write-Host "[oneport] Installing server deps..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\server"
Run-Cmd "npm install"
Run-Cmd "npm install dotenv --save"
Pop-Location

# 2) Install Panel deps and build if static
Push-Location "$PSScriptRoot\Panel"
if (-not (Test-Path 'node_modules')) { Run-Cmd "npm install" }
if (-not $EnableVite) {
  if (-not (Test-Path 'dist')) { Run-Cmd "npm run build" }
}
Pop-Location

# 3) Set env
$env:PORT = "$Port"
$env:HOST = "$BindHost"
$env:ENABLE_VITE = if (${EnableVite}) { '1' } else { '0' }
$env:OPEN_BROWSER = if (${OpenBrowser}) { '1' } else { '0' }

# 3.5) Free port if occupied
try {
  $tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($tcp) {
    Write-Host "[oneport] Port $Port in use by PID $($tcp.OwningProcess). Killing..." -ForegroundColor Yellow
    Stop-Process -Id $tcp.OwningProcess -Force -ErrorAction Stop
    Start-Sleep -Milliseconds 300
  }
} catch {}

# 4) Start server
Write-Host ("[oneport] Starting server at http://{0}:{1} (Vite={2})" -f $BindHost, $Port, ${EnableVite}) -ForegroundColor Green
Push-Location "$PSScriptRoot\server"
if ($Detach) {
  # Launch node in a detached process so subsequent commands in this terminal won't send SIGINT
  Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory (Get-Location) -WindowStyle Minimized
  Write-Host "[oneport] Server launched detached (node server.js)." -ForegroundColor Green
} else {
  Run-Cmd "node server.js"
}
Pop-Location

Pop-Location