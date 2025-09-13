param(
  [int]$Port = 8011
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $here
$py = Join-Path $here '.venv\Scripts\python.exe'
if (-not (Test-Path $py)) {
  Write-Host 'Creating virtual environment...' -ForegroundColor Cyan
  python -m venv .venv
}
& $py -m pip install --upgrade pip | Out-Null
& $py -m pip install -r requirements.txt | Out-Null
# Ensure API deps
& $py -m pip install fastapi uvicorn[standard] python-multipart | Out-Null
Write-Host "Starting UDF API on port $Port..." -ForegroundColor Green
& $py -m uvicorn udf_api:app --host 127.0.0.1 --port $Port