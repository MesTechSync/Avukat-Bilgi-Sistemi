#!/bin/bash

echo "========================================"
echo "   VERİ ÇEKME SİSTEMİ HIZLI KURULUM"
echo "========================================"
echo

echo "[1/6] Python sürümü kontrol ediliyor..."
python3 --version
if [ $? -ne 0 ]; then
    echo "HATA: Python yüklü değil!"
    echo "Lütfen Python 3.8+ yükleyin"
    exit 1
fi
echo

echo "[2/6] Sanal ortam oluşturuluyor..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "HATA: Sanal ortam oluşturulamadı!"
    exit 1
fi
echo

echo "[3/6] Sanal ortam etkinleştiriliyor..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "HATA: Sanal ortam etkinleştirilemedi!"
    exit 1
fi
echo

echo "[4/6] Python bağımlılıkları yükleniyor..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "HATA: Bağımlılıklar yüklenemedi!"
    exit 1
fi
echo

echo "[5/6] Chrome tarayıcısı kontrol ediliyor..."
which google-chrome >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "UYARI: Chrome tarayıcısı bulunamadı!"
    echo "Lütfen Google Chrome yükleyin"
    echo
fi
echo

echo "[6/6] Uygulama başlatılıyor..."
echo
echo "========================================"
echo "   SİSTEM HAZIR!"
echo "========================================"
echo
echo "Panel adresi: http://localhost:5001"
echo
echo "Tarayıcınızda bu adrese gidin ve sistemi kullanmaya başlayın."
echo
echo "Durdurmak için Ctrl+C tuşlarına basın."
echo

python3 web_panel.py
