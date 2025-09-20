# Word dosyalarını TypeScript formatına dönüştürme scripti
# Kullanım: Bu script'i Word dosyalarının bulunduğu klasörde çalıştır

param(
    [string]$WordFolder = "C:\Path\To\Your\Word\Files",
    [string]$OutputFile = "src\data\convertedPetitions.ts"
)

Write-Host "Word dosyalarını TypeScript formatına dönüştürüyor..." -ForegroundColor Green

# Word Application oluştur
$Word = New-Object -ComObject Word.Application
$Word.Visible = $false

# Çıktı dosyası başlığı
$Output = @"
// Otomatik oluşturulan dilekçe örnekleri
export const convertedPetitions = [
"@

# Word dosyalarını bul ve işle
$WordFiles = Get-ChildItem -Path $WordFolder -Filter "*.docx"
$Counter = 1

foreach ($File in $WordFiles) {
    try {
        Write-Host "İşleniyor: $($File.Name)" -ForegroundColor Yellow
        
        # Word dosyasını aç
        $Document = $Word.Documents.Open($File.FullName)
        
        # İçeriği al
        $Content = $Document.Content.Text
        
        # Dosya adından başlık oluştur
        $Title = $File.BaseName -replace "_", " " -replace "-", " "
        
        # Kategori tahmin et (dosya adından)
        $Category = "Genel"
        if ($Title -match "iş|işten|kıdem|mobbing") { $Category = "İş Hukuku" }
        elseif ($Title -match "boşanma|aile|nafaka|velayet") { $Category = "Aile Hukuku" }
        elseif ($Title -match "trafik|kaza|sigorta") { $Category = "Trafik Kazası" }
        elseif ($Title -match "kira|emlak|tapu") { $Category = "Emlak Hukuku" }
        
        # Değişkenleri bul (büyük harfli kelimeler)
        $Variables = [regex]::Matches($Content, '\b[A-ZÜĞŞÇÖI]{3,}\b') | 
                    ForEach-Object { $_.Value } | 
                    Select-Object -Unique | 
                    Where-Object { $_.Length -gt 2 }
        
        # TypeScript formatında ekle
        $Output += @"

  {
    id: 'user-$($Counter.ToString("000"))',
    title: '$Title',
    category: '$Category',
    keywords: ['${Title.Split(" ")[0..2] -join "', '"}'],
    variables: ['$($Variables -join "', '")'],
    content: ``
$($Content -replace '`', '\`' -replace '\$', '\$')
``
  },
"@
        
        $Document.Close()
        $Counter++
        
    } catch {
        Write-Host "Hata: $($File.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

$Output += @"

];
"@

# Dosyaya yaz
$Output | Out-File -FilePath $OutputFile -Encoding UTF8

# Word'ü kapat
$Word.Quit()

Write-Host "Dönüştürme tamamlandı! $($Counter-1) dosya işlendi." -ForegroundColor Green
Write-Host "Çıktı dosyası: $OutputFile" -ForegroundColor Cyan