@echo off
echo ========================================
echo    VERİ ÇEKME SİSTEMİ HIZLI KURULUM
echo ========================================
echo.

echo [1/6] Python sürümü kontrol ediliyor...
python --version
if %errorlevel% neq 0 (
    echo HATA: Python yüklü değil!
    echo Lütfen Python 3.8+ yükleyin: https://python.org
    pause
    exit /b 1
)
echo.

echo [2/6] Sanal ortam oluşturuluyor...
python -m venv venv
if %errorlevel% neq 0 (
    echo HATA: Sanal ortam oluşturulamadı!
    pause
    exit /b 1
)
echo.

echo [3/6] Sanal ortam etkinleştiriliyor...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo HATA: Sanal ortam etkinleştirilemedi!
    pause
    exit /b 1
)
echo.

echo [4/6] Python bağımlılıkları yükleniyor...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo HATA: Bağımlılıklar yüklenemedi!
    pause
    exit /b 1
)
echo.

echo [5/6] Chrome tarayıcısı kontrol ediliyor...
where chrome >nul 2>&1
if %errorlevel% neq 0 (
    echo UYARI: Chrome tarayıcısı bulunamadı!
    echo Lütfen Google Chrome yükleyin: https://chrome.google.com
    echo.
)
echo.

echo [6/6] Uygulama başlatılıyor...
echo.
echo ========================================
echo    SİSTEM HAZIR!
echo ========================================
echo.
echo Panel adresi: http://localhost:5001
echo.
echo Tarayıcınızda bu adrese gidin ve sistemi kullanmaya başlayın.
echo.
echo Durdurmak için Ctrl+C tuşlarına basın.
echo.

python web_panel.py

pause
