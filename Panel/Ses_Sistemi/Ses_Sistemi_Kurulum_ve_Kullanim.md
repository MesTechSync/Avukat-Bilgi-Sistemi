# Avukat Bilgi Sistemi — Ses Sistemi Kurulum ve Kullanım

Bu kılavuz, uygulamaya eklenen minimal ve güvenli sesli kontrol özelliğinin kurulumu, kullanımı ve sorun giderimini açıklar. Sistem, tarayıcıların yerleşik Web Speech API’sini kullanır ve yalnızca güvenli eylemleri kapsar: sekmeler arası navigasyon, arama sekmesine geçiş ve tema (gece/gündüz) değişimi.

## Neler Dahil?

- Web Speech API tabanlı basit bir yöneticı: `Panel/src/lib/voiceSystem.ts`
- React kancası ve UI: `Panel/src/hooks/useVoiceControl.ts`, `Panel/src/components/VoiceControl.tsx`
- Uygulamaya kablolama: `Panel/src/App.tsx` içinde `voice-command` olay dinleyicisi
- Veritabanı hazırlığı (opsiyonel): `Panel/supabase/migrations/20250914_voice_system.sql`

Bu sürüm ek bağımlılık gerektirmez; mevcut Vite + React yapılandırmasıyla derlenir.

## Kurulum

1) Bağımlılıkları yükleyin ve üretim derlemesi alın.

    - Kök dizinden: `npm run install` ardından `npm run build`
    - Çıktı üretimi: `Panel/dist/`

2) Ortam gereksinimleri

    - Tarayıcı: Chrome/Edge (tr-TR Web Speech API desteği iyi), HTTPS altında çalıştırın (localhost hariç)
    - Mikrofon izni: İlk dinleme sırasında tarayıcı izni gerekir

3) Uygulama entegrasyonu (hazır)

    - `App.tsx` içinde `VoiceControl` bileşeni render edilir ve `voice-command` olayları, sekme/tema aksiyonlarına bağlanmıştır.

Not: Ses desteği algılanmazsa (API yoksa) `VoiceControl` bileşeni görünmez ve sistem devre dışı kalır.

## Kullanım

Sağ alt köşedeki yuvarlak mikrofon butonuyla dinlemeyi başlatıp durdurabilirsiniz. Desteklenen komut örnekleri:

- “Ana sayfa” → Dashboard sekmesi
- “Davalar” → Dava Yönetimi sekmesi
- “Müvekkiller” → Müvekkil Yönetimi sekmesi
- “Takvim” veya “Randevu” → Randevu Yönetimi sekmesi
- “Ayarlar” → Ayarlar sekmesi
- “Ara [metin]” veya “Arama yap [metin]” → Arama sekmesine geçer (sorgu parametresi event detayındadır)
- “Karanlık mod / Gece modu” → Koyu tema
- “Aydınlık mod / Gündüz modu” → Açık tema

Dil: Türkçe (tr-TR). Komutları kısa ve net söyleyin.

## Geliştirici Notları (Kısa API)

- Intent çözümleme: `VoiceManager.analyzeIntent(transcript)` → `{ category, action, parameters }`
- Yayınlanan olay: `window.dispatchEvent(new CustomEvent('voice-command', { detail: { transcript, intent } }))`
- `App.tsx` içinde aksiyonlar: `NAV_*`, `SEARCH`, `DARK_MODE`, `LIGHT_MODE`

Bu olay mekanizması ile yeni özelliklere güvenli şekilde bağlanabilirsiniz (örneğin belli bir modül görünürse ekstra komutlar).

## Sorun Giderme

- Web Speech API desteklenmiyor: Eski tarayıcı veya iOS Safari sürümleri olabilir. Bileşen otomatik gizlenir; sistem normal çalışır.
- Mikrofon izni reddedildi: Tarayıcı ayarlarından izin verin ve sayfayı yenileyin.
- Komutlar yanlış algılanıyor: Gürültüsüz ortamda, Türkçe ve kısa cümlelerle deneyin; “Ara [sorgu]” kalıbını kullanın.
- HTTPS uyarıları: Üretimde HTTPS zorunlu; localhost geliştirici modunda serbesttir.

## Güvenlik ve Gizlilik

- Ses işleme tarayıcıda gerçekleşir; sunucuya ses gönderilmez.
- RLS politikaları ile hazırlanan tablolar (opsiyonel) kullanıcı bazlı kayda uygundur, ancak istemci şu an veri yazmaz.

## Rollback (Geri Alma) Planı

Sesi tamamen devre dışı bırakmak için:

- `App.tsx` içinde `<VoiceControl />` satırını geçici olarak yorum satırı yapın veya kaldırın.
- İleri düzey: `Panel/src/components/VoiceControl.tsx` bileşenini `return null;` olacak şekilde geçici stub’a çevirin.

Bu işlemler yalnızca UI’yı etkiler; tema ve diğer özellikler çalışmaya devam eder.

—

Son güncelleme: 2025-09-14
        });
