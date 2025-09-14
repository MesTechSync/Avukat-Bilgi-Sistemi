# 🤖 Avukat Bilgi Sistemi AI Komut Şablonu v3.0 (Hukuk Odaklı)

Bu şablon, Avukat Bilgi Sistemi için yapay zekâ destekli geliştirme, test, devops ve operasyon süreçlerini A+ kalite, izlenebilir ve hatasız şekilde yürütmek amacıyla hazırlanmıştır. v2 eğitim örnek şablonundan ilham alınmış, ancak hukuk/avukatlık ihtiyaçlarına uyarlanmıştır.

---

## 🎯 1) Çekirdek Emirler (Hukuk Odaklı)

- Türk hukuk süreçlerine ve KVKK’ya uygun çalış; veri gizliliğini asla ihlal etme.
- Sistematik ilerle; her adımda kalite kapısı (build/test/security) uygula.
- Her teslim öncesi: fonksiyonel doğrulama, performans kontrolü ve rollback planı hazırla.
- İstemci (React/Vite) + Supabase (Auth/DB/Storage) entegrasyonlarında tip ve hata kontrolünü zorunlu kıl.
- Gereken yerlerde demo modu ile production mod davranışlarını ayır; env ile yönet.
- Dokümantasyon güncel değilse teslim tamam sayılmaz.

---

## 🔍 2) Kontrol & Tekrar Kalıpları (Kalite Disiplini)

- “Bu adım %100 tamamlandı mı? Kanıt nedir? (log, build çıktısı, ekran görüntüsü)”
- “Kontrol listesini tekrar et; eksik varsa işaretle ve kullanıcı etkisini değerlendir.”
- “Devam etmeden önce otomatik test/preview yap, kritik sayfalar (Dashboard, Dosyalar, Duruşma Takvimi) açılıyor mu doğrula.”
- “Meta-check: Bir üst bakışla tekrar kontrol et (DX, UX, güvenlik, performans).”

---

## 🚀 3) Teslim Ritmi

- Büyük işleri parçalara böl: Vaka/Dosya → Duruşma Takvimi → Müvekkil → Evrak/Delil → Faturalama → Bildirim → Raporlama.
- Her parça sonunda A+ kalite raporu oluştur: neler değişti, nasıl test edildi, metrikler ve riskler.
- Tekrara düşme; kısa, net, kanıtlı ilerle.

---

## 🧾 4) Teknik Disiplin ve Loglama

- Önemli adımları logla: build, deploy, hatalar, kullanıcı kritik etkileşimleri.
- Frontend hataları için global error boundary ve console error toplama (örn. Sentry) planla (opsiyonel).
- Supabase istek/yanıt hataları kullanıcıya sızmadan yakalansın; uyarı/toast + geri dönüş stratejisi.

---

## ⚖️ 5) Hukuk Modülü Senaryoları

### 5.1) Dava/Dosya Yönetimi

1) Dosya CRUD akışlarını uygula ve test et.
2) Supabase tablo şeması ve RLS politikalarını hazırla (yalnızca yetkili erişim).
3) Listeleme, filtreleme (müvekkil, durum, tarih), sıralama performansı.
4) Kanıt: UI screen, Supabase sorgu süreleri, RLS testleri.

### 5.2) Duruşma Takvimi

1) Takvim görünümü, günlük/haftalık/aylık görünüm.
2) Hatırlatma ve bildirim (email/push tercihe bağlı).
3) Çakışma/çifte rezervasyon uyarıları.
4) Kanıt: test verileriyle render, bildirim provası (dry-run).

### 5.3) Evrak/Delil Yönetimi

1) Dosya yükleme, tür doğrulama, boyut limitleri.
2) Depolama: Supabase Storage bucket’ları; yalnızca ilgili kullanıcılar erişebilsin.
3) Önizleme (PDF/image) ve sürümleme kurgusu.
4) Kanıt: yükleme/indirme testleri, erişim kontrolü senaryoları.

### 5.4) Müvekkil Yönetimi

1) Profil, iletişim bilgileri, ilişkili dosyalar.
2) KVKK’ya uygun veri maskeleme ve export/delete talepleri (opsiyonel yol haritası).
3) Kanıt: UI/UX akış testleri, veri anonimleştirme örneği.

### 5.5) Faturalama (Opsiyonel Yol Haritası)

1) Hizmet kalemleri, saatlik/pausal ücret, tahsilat.
2) Entegrasyon: iyzico/Stripe benzeri (gelecek planı).
3) Kanıt: fatura oluşturma maketi, sahte ödeme akışı dry-run.

---

## 🧰 6) Geliştirme Komutları (Örnekler)

```bash
# Bileşen üret
ai: create-component \
  --name CaseList \
  --type functional \
  --styling tailwind \
  --location src/components/case/

# Performans iyileştir
ai: optimize-component \
  --file src/components/Calendar.tsx \
  --metrics render-time,bundle-size,mem-usage

# Supabase şema önerisi
ai: generate-schema \
  --table cases \
  --fields id:uuid,title:text,client_id:uuid,status:text,hearing_date:timestamptz \
  --indexes client_id,status,hearing_date \
  --rls enabled
```

---

## 🧪 7) Test Stratejisi

- Birim: yardımcı fonksiyonlar, tarih/formatlayıcılar.
- Bileşen: form validasyonları, listeleme/filtreleme.
- Entegrasyon: Supabase ile veri akışı (mock ile/gerçek anahtarlarla staging).
- E2E (opsiyonel): kritik kullanıcı akışları (dosya oluştur, evrak ekle, takvime yaz).

```bash
# Unit
npm run test

# E2E (ör)
npx cypress run
```

---

## 🌐 8) Deployment (Coolify + Docker)

- Node 20, Dockerfile prod serve (nginx)
- Ortam değişkenleri (Coolify Environment bölümünde):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_BACKEND_URL (opsiyonel)
- Domain izinleri:
  - vite.config.ts → preview.allowedHosts
  - Dockerfile → nginx server_name

```bash
# Production build (lokal doğrulama)
cd Panel
npm ci
npm run build

# Docker (lokal)
docker build -t avukat-bilgi-sistemi .
docker run -p 8080:80 avukat-bilgi-sistemi
```

---

## 🔍 9) İzleme ve Doğrulama

```bash
# Health (statik SPA için 200 dönmeli)
curl -I https://avukat-bilgi-sistemi.hidlightmedya.tr

# Hata logları (Coolify UI / docker logs)
# Performans (opsiyonel)
# lighthouse https://avukat-bilgi-sistemi.hidlightmedya.tr
```

Kontrol listesi:

- [ ] Ana sayfa 200 OK
- [ ] Ana rotalar yükleniyor (dashboard, cases, calendar)
- [ ] Env ile gerçek Supabase bağlantısı sağlandı
- [ ] Tarayıcı konsolunda kritik hata yok

---

## 🛡️ 10) Güvenlik Kontrolleri

- HTTPS zorunlu; çerez ve localStorage kullanımında hassas veri tutma.
- Supabase RLS; yalnız yetkili kullanıcının verisi görünür.
- Input validation; XSS/CSRF önlemleri ve güvenli header’lar (nginx).
- Loglarda kişisel veri sızıntısı olmamalı.

---

## 🧯 11) Sorun Giderme

- Build başarısız: Node < 20, eksik postcss/autoprefixer; `npm ci && npm run build` deneyin.
- Deploy başarısız: Coolify loglarına bakın, Dockerfile adımlarını doğrulayın.
- “Blocked request/host”: vite preview allowedHosts ve nginx server_name ayarlı mı?
- Beyaz sayfa: network tab’da asset 404 var mı; base yolu doğru mu; dist içerikleri kopyalandı mı?

---

## ✅ 12) Yayın Sonrası Doğrulama

```bash
# 1) Ana rotalar
curl -I https://avukat-bilgi-sistemi.hidlightmedya.tr

# 2) Hızlı smoke
# Kullanıcı akışı: aç → dosyalar → takvim → evrak yükle (staging’de önerilir)

# 3) SSL ve güvenlik başlıkları
# Qualys/SSL Labs ile dış test (opsiyonel)
```

---

## 🔗 13) Bağlantılar

- Hukuk v3 (Bu dosya): AI_COMMAND_TEMPLATE_v3.md

---

Son Güncelleme: 2025-09
