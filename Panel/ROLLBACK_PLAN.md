# 🔄 Mevzuat_3 Geri Dönüşüm Planı (Rollback Plan)

## 📋 **Genel Bakış**

Bu doküman, Mevzuat_3 sisteminde yapılan değişikliklerin geri alınması için kapsamlı bir plan içerir. KVKK uyumluluğu, güvenlik ve veri bütünlüğü korunarak güvenli geri dönüş sağlanır.

---

## 🎯 **Geri Dönüş Senaryoları**

### **1. Acil Durum Geri Dönüşü (0-15 dakika)**
- Sistem çökmesi durumunda
- Kritik güvenlik açığı tespit edildiğinde
- Veri kaybı riski olduğunda

### **2. Planlı Geri Dönüş (1-4 saat)**
- Deployment sonrası sorunlar
- Performans sorunları
- Kullanıcı şikayetleri

### **3. Kısmi Geri Dönüş (1-2 gün)**
- Belirli özelliklerde sorun
- Modüler geri alma
- Aşamalı düzeltme

---

## 🚨 **Acil Durum Geri Dönüşü**

### **Adım 1: Sistem Durumu Kontrolü**
```bash
# Sistem durumunu kontrol et
curl -f http://localhost:5175/health || echo "Sistem çökmüş"

# Log dosyalarını kontrol et
tail -f /var/log/nginx/mevzuat3_error.log
tail -f /var/log/nginx/mevzuat3_access.log
```

### **Adım 2: Hızlı Geri Dönüş**
```bash
# 1. Mevcut deployment'ı durdur
sudo systemctl stop nginx
sudo systemctl stop mevzuat3-backend

# 2. Önceki sürüme geri dön
cd /var/www/mevzuat3
sudo ln -sfn releases/$(ls -t releases/ | tail -n +2 | head -n 1) current

# 3. Servisleri yeniden başlat
sudo systemctl start nginx
sudo systemctl start mevzuat3-backend

# 4. Sistem durumunu kontrol et
curl -f http://localhost:5175/health
```

### **Adım 3: Veri Bütünlüğü Kontrolü**
```sql
-- Supabase veritabanı durumunu kontrol et
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM voice_history;
SELECT COUNT(*) FROM petition_docs;
SELECT COUNT(*) FROM contract_docs;

-- Son 1 saatteki değişiklikleri kontrol et
SELECT * FROM user_profiles WHERE updated_at > NOW() - INTERVAL '1 hour';
```

---

## 📦 **Planlı Geri Dönüş**

### **Adım 1: Backup Kontrolü**
```bash
# Backup dosyalarının varlığını kontrol et
ls -la /var/backups/mevzuat3/
ls -la /var/www/mevzuat3/releases/

# Son backup'ın tarihini kontrol et
ls -lt /var/www/mevzuat3/releases/ | head -5
```

### **Adım 2: Veritabanı Backup'ı**
```bash
# Supabase backup oluştur
pg_dump -h your-supabase-host -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Local backup oluştur
tar -czf mevzuat3_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/mevzuat3/current/
```

### **Adım 3: Aşamalı Geri Dönüş**
```bash
# 1. Maintenance mode aktif et
echo "Sistem bakımda. Lütfen daha sonra tekrar deneyin." > /var/www/mevzuat3/maintenance.html

# 2. Mevcut kullanıcıları bilgilendir
# (E-posta/SMS bildirimi gönder)

# 3. Önceki sürüme geç
cd /var/www/mevzuat3
sudo ln -sfn releases/backup_20250919_120000 current

# 4. Sistem testleri yap
npm run test
curl -f http://localhost:5175/health

# 5. Maintenance mode'u kaldır
rm /var/www/mevzuat3/maintenance.html
```

---

## 🔧 **Kısmi Geri Dönüş**

### **Ses Sistemi Geri Dönüşü**
```bash
# 1. Ses sistemi dosyalarını geri yükle
cd /var/www/mevzuat3/current/src/lib
cp backup/voiceSystem.ts ./
cp backup/voiceCommands.ts ./
cp backup/voicePhonetics.ts ./

# 2. Build'i yenile
npm run build

# 3. Test et
npm run test:voice
```

### **KVKK Sistemi Geri Dönüşü**
```bash
# 1. Privacy dosyalarını geri yükle
cd /var/www/mevzuat3/current/src/lib
cp backup/privacyManager.ts ./
cp backup/authManager.ts ./

# 2. Veritabanı şemasını geri yükle
psql -h your-supabase-host -U postgres -d postgres < backup/schema_backup.sql

# 3. Test et
npm run test:privacy
```

### **Backend Geri Dönüşü**
```bash
# 1. Backend dosyalarını geri yükle
cd /var/www/mevzuat3/current
cp backup/panel_backend.py ./
cp backup/requirements.txt ./

# 2. Python bağımlılıklarını yenile
pip install -r requirements.txt

# 3. Backend'i yeniden başlat
sudo systemctl restart mevzuat3-backend
```

---

## 📊 **Geri Dönüş Kontrol Listesi**

### **Öncesi Kontroller**
- [ ] Backup dosyaları mevcut mu?
- [ ] Veritabanı backup'ı alındı mı?
- [ ] Kullanıcılar bilgilendirildi mi?
- [ ] Maintenance window planlandı mı?
- [ ] Rollback ekibi hazır mı?

### **Sırasında Kontroller**
- [ ] Sistem durumu izleniyor mu?
- [ ] Log dosyaları takip ediliyor mu?
- [ ] Veri bütünlüğü kontrol ediliyor mu?
- [ ] Kullanıcı etkileşimi izleniyor mu?
- [ ] Hata mesajları takip ediliyor mu?

### **Sonrası Kontroller**
- [ ] Sistem sağlıklı çalışıyor mu?
- [ ] Tüm özellikler test edildi mi?
- [ ] Performans metrikleri normal mi?
- [ ] Kullanıcı şikayetleri var mı?
- [ ] Güvenlik açıkları kontrol edildi mi?

---

## 🛠️ **Geri Dönüş Araçları**

### **Otomatik Rollback Script**
```bash
#!/bin/bash
# auto-rollback.sh

set -e

BACKUP_DIR="/var/backups/mevzuat3"
RELEASES_DIR="/var/www/mevzuat3/releases"
CURRENT_DIR="/var/www/mevzuat3/current"

echo "🔄 Mevzuat_3 Otomatik Geri Dönüş Başlatılıyor..."

# 1. Sistem durumunu kontrol et
if curl -f http://localhost:5175/health > /dev/null 2>&1; then
    echo "✅ Sistem çalışıyor, geri dönüş gerekli değil"
    exit 0
fi

echo "❌ Sistem çökmüş, geri dönüş başlatılıyor..."

# 2. En son backup'ı bul
LATEST_BACKUP=$(ls -t $RELEASES_DIR | head -n 1)
echo "📦 En son backup: $LATEST_BACKUP"

# 3. Geri dönüş yap
cd /var/www/mevzuat3
sudo ln -sfn releases/$LATEST_BACKUP current

# 4. Servisleri yeniden başlat
sudo systemctl restart nginx
sudo systemctl restart mevzuat3-backend

# 5. Sistem durumunu kontrol et
sleep 10
if curl -f http://localhost:5175/health > /dev/null 2>&1; then
    echo "✅ Geri dönüş başarılı!"
else
    echo "❌ Geri dönüş başarısız, manuel müdahale gerekli"
    exit 1
fi
```

### **Veritabanı Rollback Script**
```bash
#!/bin/bash
# db-rollback.sh

set -e

BACKUP_FILE="/var/backups/mevzuat3/db_backup_$(date +%Y%m%d).sql"
SUPABASE_HOST="your-supabase-host"
SUPABASE_DB="postgres"

echo "🔄 Veritabanı Geri Dönüş Başlatılıyor..."

# 1. Mevcut veritabanını backup'la
pg_dump -h $SUPABASE_HOST -U postgres -d $SUPABASE_DB > /tmp/pre_rollback_backup.sql

# 2. Backup dosyasını geri yükle
if [ -f "$BACKUP_FILE" ]; then
    psql -h $SUPABASE_HOST -U postgres -d $SUPABASE_DB < $BACKUP_FILE
    echo "✅ Veritabanı geri dönüş başarılı"
else
    echo "❌ Backup dosyası bulunamadı: $BACKUP_FILE"
    exit 1
fi
```

---

## 📈 **Geri Dönüş Metrikleri**

### **Başarı Kriterleri**
- **Sistem Uptime:** %99.9+
- **Yanıt Süresi:** <200ms
- **Hata Oranı:** <0.1%
- **Kullanıcı Memnuniyeti:** %95+

### **İzleme Metrikleri**
```bash
# Sistem durumu
curl -s http://localhost:5175/health | jq '.status'

# Performans metrikleri
curl -s http://localhost:8080/metrics

# Log analizi
tail -f /var/log/nginx/mevzuat3_access.log | grep -E "(error|500|502|503)"
```

---

## 🚨 **Acil Durum İletişim**

### **İletişim Listesi**
- **Teknik Sorumlu:** +90 XXX XXX XX XX
- **Sistem Yöneticisi:** +90 XXX XXX XX XX
- **Güvenlik Uzmanı:** +90 XXX XXX XX XX
- **KVKK Sorumlusu:** +90 XXX XXX XX XX

### **Eskalasyon Süreci**
1. **Seviye 1:** Otomatik rollback (0-15 dk)
2. **Seviye 2:** Teknik ekip müdahalesi (15-60 dk)
3. **Seviye 3:** Yönetim bilgilendirmesi (60+ dk)

---

## 📋 **Geri Dönüş Raporu**

### **Rapor Şablonu**
```markdown
# Geri Dönüş Raporu

**Tarih:** [TARİH]
**Saat:** [SAAT]
**Sorumlu:** [AD SOYAD]
**Süre:** [DURATION]

## Sorun Tanımı
- [SORUN AÇIKLAMASI]

## Geri Dönüş Süreci
- [ADIMLAR]

## Sonuç
- [SONUÇ]

## Önlemler
- [ÖNLEMLER]
```

---

## ✅ **Sonuç**

Bu geri dönüşüm planı, Mevzuat_3 sisteminin güvenli ve hızlı bir şekilde önceki duruma döndürülmesini sağlar. KVKK uyumluluğu ve veri güvenliği korunarak, minimum kesinti ile sistem stabilitesi sağlanır.

**🎯 Hedef:** Maksimum 15 dakikada acil durum geri dönüşü, 4 saat içinde tam sistem geri dönüşü.

---

*Doküman Tarihi: 20 Eylül 2025*  
*Versiyon: 1.0*  
*Son Güncelleme: 20 Eylül 2025*

