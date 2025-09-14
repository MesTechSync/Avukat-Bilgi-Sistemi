# Avukat Bilgi Sistemi — Ses Sistemi Test Rehberi

Bu rehber, sesli kontrol MVP’sinin doğru çalıştığını doğrulamak için minimal, hızlı ve pratik test adımlarını içerir.

## Önkoşullar

- Chrome veya Edge (güncel sürüm), `tr-TR` dil desteği.
- Üretimde HTTPS; geliştirmede localhost uygundur.
- Mikrofon izni verilebilir durumda olmalı.

## Hızlı Doğrulama (Smoke Test)

1. Mikrofon butonu görünürlüğü

- Sağ alt köşede yuvarlak mikrofon butonu görünmeli. Görünmüyorsa API desteklenmiyor olabilir (beklenen durum; uygulama normal çalışır).

1. Tema komutları

- Dinlemeyi başlatın ve “Karanlık mod” deyin; koyu tema anında uygulanmalı.
- “Aydınlık mod” deyin; açık temaya dönmeli.

1. Navigasyon komutları

- “Ana sayfa”, “Davalar”, “Müvekkiller”, “Takvim”, “Ayarlar” komutlarını sırayla deneyin; ilgili sekme aktif olmalı.

1. Arama komutu

- “Ara boşanma davası” deyin; arama sekmesine geçmeli ve event detayında `parameters.query` dolu gelmeli.

Başarılıysa MVP kabul ölçütleri sağlanmıştır.

## Genişletilmiş Testler

- Gürültülü ortamda ve sessiz ortamda kısa testler yapın; yanlış algılamayı gözlemleyin.
- Farklı telaffuzlarla “ara …” kalıbını deneyin (ör. “arama yap nafaka”).
- Dinleme uzun süre açıkken CPU kullanımını Görev Yöneticisi ile gözlemleyin; ihtiyaç halinde dinlemeyi kapatın.

## Başarı Kriterleri

- Tema komutları 1 saniye içinde uygulansın.
- Sekme değişimi 1 saniye içinde gerçekleşsin.
- “Ara …” komutu arama sekmesine geçirsin; parametre üretilebilsin.
- Destek yoksa sistem sessizce devre dışı kalsın (hata göstermesin).

## Sorun Giderme

- Mikrofon reddedildi: Tarayıcı izinlerini açın ve yenileyin.
- Destek yok: Güncel Chrome/Edge kullanın; HTTPS altında test edin.
- Komutlar anlaşılmıyor: Kısa ve net söyleyin; Türkçe kullanın; gürültüyü azaltın.

## Rollback (Geri Alma)

- `App.tsx` içindeki `<VoiceControl />`’ü geçici olarak kaldırın veya yorumlayın.

—

Son güncelleme: 2025-09-14
