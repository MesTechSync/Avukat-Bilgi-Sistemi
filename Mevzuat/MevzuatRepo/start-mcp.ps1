Param(
  [switch]$NoLogo
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$exe = Join-Path $here '.venv\Scripts\mevzuat-mcp.exe'
if (!(Test-Path $exe)) {
  Write-Error "Venv içinde mevzuat-mcp.exe bulunamadı: $exe. Önce bağımlılıkları kurun."
}
& $exe @()
