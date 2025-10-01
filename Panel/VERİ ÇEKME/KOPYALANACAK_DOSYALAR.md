# 📁 KOPYALANACAK DOSYALAR LİSTESİ

## 🎯 Ana Dosyalar (Zorunlu)

### 1. `web_panel.py`
- **Açıklama**: Ana Flask uygulaması
- **Boyut**: ~30KB
- **Özellikler**: 
  - UYAP ve Yargıtay karar arama
  - Web arayüzü
  - Excel/CSV dışa aktarma
  - Sayfalama sistemi
  - Detaylı log takibi

### 2. `templates/index.html`
- **Açıklama**: Web arayüzü HTML dosyası
- **Boyut**: ~25KB
- **Özellikler**:
  - Modern ve responsive tasarım
  - UYAP tarzı arayüz
  - JavaScript ile dinamik içerik
  - Sayfalama kontrolleri

### 3. `requirements.txt`
- **Açıklama**: Python bağımlılıkları
- **Boyut**: ~200 bytes
- **İçerik**:
  ```
  Flask==2.3.3
  selenium==4.15.0
  pandas==2.1.1
  openpyxl==3.1.2
  requests>=2.28.0
  beautifulsoup4>=4.11.0
  lxml>=4.9.0
  ```

## 📋 Kopyalama Adımları

### 1. Yeni Klasör Oluşturma
```bash
mkdir VERİ_ÇEKME_SİSTEMİ
cd VERİ_ÇEKME_SİSTEMİ
```

### 2. Templates Klasörü
```bash
mkdir templates
```

### 3. Dosya Kopyalama
```bash
# Ana dosyalar
cp web_panel.py ./
cp requirements.txt ./
cp KURULUM_REHBERI.md ./

# Templates
cp templates/index.html ./templates/
```

## 🔧 Kurulum Sonrası

### 1. Python Sanal Ortamı
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Bağımlılıkları Yükleme
```bash
pip install -r requirements.txt
```

### 3. ChromeDriver Kurulumu
- Chrome tarayıcısı yüklü olmalı
- ChromeDriver'ı PATH'e ekleyin

### 4. Çalıştırma
```bash
python web_panel.py
```

## 🌐 Erişim
- **Yerel**: `http://localhost:5001`
- **Ağ**: `http://[IP_ADRESI]:5001`

## ✅ Kontrol Listesi
- [ ] `web_panel.py` kopyalandı
- [ ] `templates/index.html` kopyalandı
- [ ] `requirements.txt` kopyalandı
- [ ] `KURULUM_REHBERI.md` kopyalandı
- [ ] Python 3.8+ yüklü
- [ ] Chrome tarayıcısı yüklü
- [ ] ChromeDriver kurulu
- [ ] Bağımlılıklar yüklendi
- [ ] Uygulama çalışıyor
- [ ] Web arayüzü erişilebilir

## 🎯 Başarı Kriterleri
- ✅ `http://localhost:5001` adresine erişilebiliyor
- ✅ Web arayüzü görünüyor
- ✅ Arama yapılabiliyor
- ✅ Excel dosyası indirilebiliyor
- ✅ Loglar görünüyor

**🚀 Sistem hazır!**
