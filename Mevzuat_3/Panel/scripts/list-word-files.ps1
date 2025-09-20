# Word olmayan sistemler için alternatif - dosya adları ve boyutları listeler
param(
    [string]$WordFolder = "C:\Path\To\Your\Word\Files"
)

Write-Host "Word dosyaları analiz ediliyor..." -ForegroundColor Green

$Files = Get-ChildItem -Path $WordFolder -Filter "*.doc*"

Write-Host "`nBulunan dosyalar:" -ForegroundColor Yellow
foreach ($File in $Files) {
    $SizeKB = [math]::Round($File.Length / 1KB, 1)
    Write-Host "- $($File.Name) ($SizeKB KB)" -ForegroundColor White
}

Write-Host "`nToplamda $($Files.Count) dosya bulundu." -ForegroundColor Green
Write-Host "Bu dosyaları manuel olarak kopyalamak için userPetitions.ts dosyasını kullanın." -ForegroundColor Cyan