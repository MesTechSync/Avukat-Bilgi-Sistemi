# 🚀 VERİ ÇEKME SİSTEMİ KURULUM REHBERİ

## 📋 GEREKSİNİMLER

### 1. Sistem Gereksinimleri
- **Python 3.8+** (Python 3.12 önerilir)
- **Google Chrome** tarayıcısı
- **ChromeDriver** (Chrome sürümü ile uyumlu)
- **Windows 10/11** veya **Linux/Mac**

### 2. Python Kütüphaneleri
```
Flask==2.3.3
selenium==4.15.0
pandas==2.1.1
openpyxl==3.1.2
requests>=2.28.0
beautifulsoup4>=4.11.0
lxml>=4.9.0
```

## 📁 KOPYALANACAK DOSYALAR

### Ana Dosyalar
```
📦 VERİ_ÇEKME_SİSTEMİ/
├── 📄 web_panel.py          # Ana Flask uygulaması
├── 📄 requirements.txt      # Python bağımlılıkları
├── 📄 README.md            # Dokümantasyon
├── 📄 KURULUM_REHBERI.md   # Bu dosya
└── 📁 templates/
    └── 📄 index.html        # Web arayüzü
```

## 🔧 KURULUM ADIMLARI

### 1. Python Kurulumu
```bash
# Python 3.8+ yüklü olmalı
python --version
# veya
python3 --version
```

### 2. Proje Klasörü Oluşturma
```bash
# Yeni klasör oluştur
mkdir VERİ_ÇEKME_SİSTEMİ
cd VERİ_ÇEKME_SİSTEMİ
```

### 3. Sanal Ortam Oluşturma (Önerilen)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 4. Bağımlılıkları Yükleme
```bash
# requirements.txt dosyasını kopyaladıktan sonra
pip install -r requirements.txt
```

### 5. ChromeDriver Kurulumu

#### Windows:
1. Chrome sürümünüzü kontrol edin: `chrome://version/`
2. [ChromeDriver](https://chromedriver.chromium.org/) indirin
3. ChromeDriver'ı PATH'e ekleyin veya proje klasörüne koyun

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# CentOS/RHEL
sudo yum install chromium-chromedriver
```

#### Mac:
```bash
# Homebrew ile
brew install chromedriver
```

### 6. Dosyaları Kopyalama
- `web_panel.py` dosyasını proje klasörüne kopyalayın
- `templates/index.html` dosyasını `templates/` klasörüne kopyalayın
- `requirements.txt` dosyasını proje klasörüne kopyalayın

## 🚀 ÇALIŞTIRMA

### 1. Uygulamayı Başlatma
```bash
# Proje klasöründe
python web_panel.py
```

### 2. Erişim
- **Yerel erişim**: `http://localhost:5001`
- **Ağ erişimi**: `http://[IP_ADRESI]:5001`

## ⚙️ YAPILANDIRMA

### Port Değiştirme
`web_panel.py` dosyasında:
```python
# Satır 705'te port numarasını değiştirin
app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
```

### Host Ayarları
```python
# Sadece yerel erişim için
app.run(host='127.0.0.1', port=5001, debug=True, use_reloader=False)

# Tüm ağlardan erişim için
app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
```

## 🔒 GÜVENLİK AYARLARI

### Windows Güvenlik Duvarı
1. **Windows Defender Firewall** açın
2. **Gelişmiş ayarlar** > **Gelen kurallar**
3. **Yeni kural** > **Port** > **TCP** > **5001**
4. **Bağlantıya izin ver** seçin

### Production Modu
```python
# Güvenlik için debug=False yapın
app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
```

## 🧪 TEST

### 1. Temel Test
1. `http://localhost:5001` adresine gidin
2. Anahtar kelime girin (örn: "tazminat")
3. Sayfa sayısını belirleyin (örn: 5)
4. Sistemi seçin (UYAP, Yargıtay veya Her İkisi)
5. "Aramayı Başlat" butonuna tıklayın

### 2. Excel İndirme Testi
1. Arama tamamlandıktan sonra
2. "Excel Dosyasını İndir" butonuna tıklayın
3. Dosyanın indirildiğini kontrol edin

## 🐛 SORUN GİDERME

### Yaygın Sorunlar

#### 1. Port Kullanımda
```
Hata: [Errno 98] Address already in use
Çözüm: Farklı port numarası kullanın
```

#### 2. ChromeDriver Hatası
```
Hata: 'chromedriver' executable needs to be in PATH
Çözüm: ChromeDriver'ı PATH'e ekleyin veya proje klasörüne koyun
```

#### 3. Bağımlılık Hatası
```
Hata: ModuleNotFoundError: No module named 'flask'
Çözüm: pip install -r requirements.txt
```

#### 4. Encoding Hatası
```
Hata: UnicodeEncodeError
Çözüm: Sistem dil ayarlarını kontrol edin
```

### Log Kontrolü
```bash
# Uygulama çalışırken terminal çıktısını kontrol edin
# Hata mesajları burada görünecek
```

## 📊 PERFORMANS AYARLARI

### Selenium Ayarları
```python
# web_panel.py içinde Chrome seçenekleri
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--window-size=1920,1080")
```

### Bellek Optimizasyonu
```python
# Büyük veri setleri için
chrome_options.add_argument("--memory-pressure-off")
chrome_options.add_argument("--max_old_space_size=4096")
```

## 🔄 GÜNCELLEMELER

### Düzenli Güncellemeler
```bash
# Bağımlılıkları güncelle
pip install --upgrade -r requirements.txt

# ChromeDriver'ı güncelle
# Chrome sürümünüzle uyumlu olanı indirin
```

### Sürüm Kontrolü
```bash
# Mevcut sürümleri kontrol et
pip list
python --version
```

## 📞 DESTEK

### Hata Raporlama
1. Hata mesajını kopyalayın
2. Sistem bilgilerinizi not edin
3. Adım adım ne yaptığınızı açıklayın

### İletişim
- GitHub Issues
- E-posta
- Dokümantasyon

## ✅ KURULUM KONTROL LİSTESİ

- [ ] Python 3.8+ yüklü
- [ ] Google Chrome yüklü
- [ ] ChromeDriver kurulu ve PATH'te
- [ ] Proje klasörü oluşturuldu
- [ ] Sanal ortam oluşturuldu (önerilen)
- [ ] Bağımlılıklar yüklendi
- [ ] Dosyalar kopyalandı
- [ ] Port ayarları yapıldı
- [ ] Güvenlik duvarı ayarlandı
- [ ] Test yapıldı
- [ ] Excel indirme test edildi

## 🎯 BAŞARILI KURULUM

Kurulum başarılı olduğunda:
- ✅ `http://localhost:5001` adresine erişebilirsiniz
- ✅ Web arayüzü görünür
- ✅ Arama yapabilirsiniz
- ✅ Excel dosyası indirebilirsiniz
- ✅ Loglar görünür

**🎉 Tebrikler! Sisteminiz hazır!**
