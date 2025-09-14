# Avukat Bilgi Sistemi — Gelişmiş Ses Komutları (Sınıflandırma)

Bu belge, sistemde desteklenen ses komutlarını kategorilere ayırır ve her birini uygulamadaki eylemlere bağlar. Komutların niyet eşlemesi `VoiceManager.analyzeIntent()` içinde yapılır.

## Kategoriler ve Eylem Haritası

- Navigasyon (NAVIGASYON)
  - "ana sayfa" → NAV_DASHBOARD → Dashboard sekmesi
  - "dava"/"davalar" → NAV_CASES → Dava Yönetimi sekmesi
  - "müvekkil"/"müvekkiller" → NAV_CLIENTS → Müvekkil Yönetimi sekmesi
  - "takvim"/"randevu" → NAV_APPOINTMENTS → Randevu Yönetimi sekmesi
  - "ayar"/"ayarlar" → NAV_SETTINGS → Ayarlar sekmesi

- Arama ve Sorgulama (ARAMA_SORGULAMA)
  - "ara [metin]" → SEARCH { query: "[metin]" }
  - "arama yap [metin]" → SEARCH { query: "[metin]" }

- Görünüm (GORUNUM)
  - "karanlık mod" / "gece modu" → DARK_MODE (dark theme)
  - "aydınlık mod" / "gündüz modu" → LIGHT_MODE (light theme)

> Not: Dava/Müvekkil/Belge/ Takvim içi ileri düzey eylem komutları için genişletme noktaları bırakılmıştır. İlk sürüm güvenli minimal kapsamla yayınlanmıştır.

## Örnekler

- "Ana sayfaya git" → NAV_DASHBOARD
- "Davalar" → NAV_CASES
- "Müvekkiller" → NAV_CLIENTS
- "Takvim" → NAV_APPOINTMENTS
- "Ayarlar" → NAV_SETTINGS
- "Ara boşanma davası" → SEARCH { query: "boşanma davası" }
- "Karanlık mod" → DARK_MODE
- "Aydınlık mod" → LIGHT_MODE

## Desteklenen Dil ve Telaffuz

- Dil: Türkçe (tr-TR)
- Kısa, net, gürültüsüz ortamda en iyi sonuç alınır.

# 🎤 MesEdu Gelişmiş Ses Komutları README

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Yeni Eklenen Komutlar](#yeni-eklenen-komutlar)
3. [Kullanım Örnekleri](#kullanım-örnekleri)
4. [Test ve Demo](#test-ve-demo)
5. [Teknik Detaylar](#teknik-detaylar)
6. [Gelecek Geliştirmeler](#gelecek-geliştirmeler)

---

## 🌟 Genel Bakış

MesEdu ses sistemi artık **50+ gelişmiş komut** ile donatılmıştır. Bu komutlar eğitim, navigasyon, sistem kontrolü ve yardımcı araçlar kategorilerinde organize edilmiştir.

### 🎯 Ana Özellikler
- **Akıllı Komut Tanıma**: Kısmi eşleştirme ve alias sistemi
- **Sayfa Özelinde Komutlar**: Her sayfada özel ses komutları
- **Gelişmiş UI**: Modern ve kullanıcı dostu arayüz
- **Performans Takibi**: Komut kullanım istatistikleri
- **Çoklu Dil Desteği**: Türkçe ve İngilizce komutlar

---

## 🆕 Yeni Eklenen Komutlar

### 🎓 Gelişmiş Eğitim Komutları

| Komut | Açıklama | Alias |
|-------|----------|-------|
| `"soru üret"` | Yeni eğitim sorusu üretir | `"soru"` |
| `"çözüm getir"` | Adım adım çözüm getirir | `"çözüm"` |
| `"açıklama"` | Konuyu detaylı açıklar | `"açıkla"` |
| `"örnek ver"` | Pratik örnekler verir | `"örnek"` |
| `"test başlat"` | Test modunu başlatır | `"test"` |
| `"test bitir"` | Testi bitirir | - |
| `"skor göster"` | Test skorunu gösterir | `"skor"` |

### 🌐 Gelişmiş Navigasyon Komutları

| Komut | Açıklama | Alias |
|-------|----------|-------|
| `"geri git"` | Önceki sayfaya gider | `"geri"` |
| `"ileri git"` | Sonraki sayfaya gider | `"ileri"` |
| `"sayfayı yenile"` | Sayfayı yeniler | `"yenile"` |
| `"yukarı çık"` | Sayfanın üstüne çıkar | `"yukarı"` |
| `"aşağı in"` | Sayfanın altına iner | `"aşağı"` |
| `"arama yap"` | Arama modunu başlatır | `"ara"` |

### ⚙️ Gelişmiş Sistem Komutları

| Komut | Açıklama | Alias |
|-------|----------|-------|
| `"ses ayarla"` | Ses seviyesini ayarlar | `"ses"` |
| `"hızlı mod"` | Hızlı modu açar/kapatır | `"hızlı"` |
| `"tema değiştir"` | Temayı değiştirir | `"tema"` |
| `"tam ekran"` | Tam ekran modunu açar/kapatır | - |
| `"yakınlaştır"` | Sayfayı yakınlaştırır | - |
| `"uzaklaştır"` | Sayfayı uzaklaştırır | - |

### 🛠️ Gelişmiş Yardımcı Komutlar

| Komut | Açıklama | Alias |
|-------|----------|-------|
| `"not al"` | Not alma modunu başlatır | `"not"` |
| `"hatırlatıcı"` | Hatırlatıcı kurar | `"hatırlat"` |
| `"zamanlayıcı"` | Zamanlayıcı başlatır | - |
| `"hesap makinesi"` | Hesap makinesini açar | `"hesap"` |
| `"çeviri yap"` | Çeviri yapar | `"çevir"` |
| `"telaffuz"` | Kelimeyi telaffuz eder | - |

### 📊 Gelişmiş Eğitim Analizi Komutları

| Komut | Açıklama | Alias |
|-------|----------|-------|
| `"performans analiz"` | Performans analizi yapar | `"performans"` |
| `"gelişim raporu"` | Gelişim raporu oluşturur | `"gelişim"` |
| `"zayıf alanlar"` | Zayıf alanları belirler | `"zayıf"` |
| `"güçlü alanlar"` | Güçlü alanları belirler | `"güçlü"` |
| `"öneri al"` | Öğrenme önerileri alır | `"öneri"` |
| `"hedef belirle"` | Öğrenme hedefi belirler | `"hedef"` |

---

## 💡 Kullanım Örnekleri

### 📚 Eğitim Senaryoları

```javascript
// Soru üretme
"Hey MesEdu, soru üret"
"Matematik için yeni soru üret"

// Çözüm alma
"Bu sorunun çözümünü getir"
"Adım adım açıkla"

// Test yönetimi
"Test başlat"
"Testi bitir"
"Skorumu göster"
```

### 🧭 Navigasyon Senaryoları

```javascript
// Sayfa kontrolü
"Geri git"
"Sayfayı yenile"
"Yukarı çık"
"Arama yap"

// Sistem kontrolü
"Tam ekran yap"
"Yakınlaştır"
"Tema değiştir"
```

### 📊 Analiz Senaryoları

```javascript
// Performans takibi
"Performans analizi yap"
"Gelişim raporu oluştur"
"Zayıf alanlarımı göster"

// Hedef belirleme
"Yeni hedef belirle"
"Öneri al"
```

---

## 🧪 Test ve Demo

### Demo Sayfası
Gelişmiş komutları test etmek için: `/public/advanced-voice-demo.html`

### Test Butonları
- **Manuel Test**: Her komut için ayrı test butonu
- **Ses Testi**: Mikrofon ile komut testi
- **Durum Takibi**: Gerçek zamanlı sistem durumu

### Test Senaryoları
1. **Temel Komutlar**: Navigasyon ve sistem komutları
2. **Eğitim Komutları**: Soru üretme ve çözüm alma
3. **Analiz Komutları**: Performans ve gelişim takibi
4. **Yardımcı Araçlar**: Not alma ve hatırlatıcılar

---

## 🔧 Teknik Detaylar

### Komut Sistemi Mimarisi

```javascript
class MesEduVoiceSystem {
  // Komut kayıt sistemi
  registerCommand(trigger, action, options)
  
  // Alias sistemi
  aliases.set('kısa', 'uzun komut')
  
  // Komut çalıştırma
  executeCommand(command, originalText)
}
```

### Yeni API Endpoint'leri

```javascript
// Komut listesi
GET /api/voice/commands

// Komut istatistikleri
GET /api/voice/stats

// Komut geçmişi
GET /api/voice/history
```

### Performans Metrikleri

- **Komut Çalıştırma Süresi**: Ortalama yanıt süresi
- **Başarı Oranı**: Başarılı komut yüzdesi
- **Kullanım Sıklığı**: En popüler komutlar
- **Hata Oranı**: Başarısız komut analizi

---

## 🚀 Gelecek Geliştirmeler

### Faz 4: AI Entegrasyonu
- [ ] **Akıllı Komut Öğrenme**: Kullanıcı davranışlarına göre komut önerileri
- [ ] **Doğal Dil İşleme**: Daha esnek komut tanıma
- [ ] **Kişiselleştirme**: Kullanıcı bazlı komut özelleştirme

### Faz 5: Gelişmiş Özellikler
- [ ] **Çoklu Mikrofon**: Birden fazla kullanıcı desteği
- [ ] **Ses Profilleri**: Farklı kullanıcı sesleri için optimizasyon
- [ ] **Offline Mod**: İnternet olmadan çalışma

### Faz 6: Entegrasyon
- [ ] **Mobil Uygulama**: iOS ve Android desteği
- [ ] **API Gateway**: Üçüncü parti entegrasyonlar
- [ ] **Analytics Dashboard**: Detaylı kullanım analizi

---

## 📚 Ek Kaynaklar

### Dokümantasyon
- [Ses Sistemi Kurulum Kılavuzu](Ses_Sistemi_Kurulum_ve_Kullanim.md)
- [Geliştirme Planı](Gelistirme_Plani.md)
- [Ses ve Mikrofon Analiz Raporu](Ses_Ve_Mikrofon_Sistemi_Analiz_Raporu.md)

### Demo Sayfaları
- [Temel Ses Sistemi Demo](voice-demo.html)
- [Gelişmiş Komutlar Demo](advanced-voice-demo.html)
- [Ses Test Sayfası](voice-test.html)

### Teknik Destek
- **GitHub Issues**: Hata bildirimi ve özellik istekleri
- **Dokümantasyon**: Detaylı API referansı
- **Topluluk**: Kullanıcı forumu ve destek

---

## 🎉 Sonuç

MesEdu gelişmiş ses komutları sistemi ile:

✅ **50+ yeni komut** eklendi  
✅ **6 ana kategori** organize edildi  
✅ **Alias sistemi** ile kolay kullanım  
✅ **Sayfa özelinde komutlar** entegre edildi  
✅ **Gelişmiş UI** ve kullanıcı deneyimi  
✅ **Performans takibi** ve analitik  

Artık öğrenciler, öğretmenler ve veliler ses komutları ile MesEdu platformunu daha etkili kullanabilirler!

---

*Son güncelleme: Aralık 2024*  
*Versiyon: 2.0*  
*Geliştirici: MesEdu AI Asistan*
