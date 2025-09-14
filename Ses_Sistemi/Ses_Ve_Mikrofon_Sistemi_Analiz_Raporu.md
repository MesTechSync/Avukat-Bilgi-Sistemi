# Avukat Bilgi Sistemi — Ses ve Mikrofon Sistemi Analiz Özeti (MVP)

Bu analiz, uygulamadaki minimal sesli kontrol kapsamını ve kararları özetler.

## Kapsam ve Kararlar

- Sunucu taraflı STT/TTS yok; yalnızca tarayıcı Web Speech API ile hafif “sesli kontrol”.
- Komut seti minimal: tema, navigasyon, arama.
- Destek olmayan tarayıcıda özellik sessizce devre dışı kalır (UI saklanır).

## Mimarinin Kısa Özeti

- `voiceSystem.ts`: Web Speech API sarmalayıcı + basit intent analizi.
- `useVoiceControl` kancası: durum/başlat/durdur.
- `VoiceControl` bileşeni: sağ alt mikrofon butonu, son transcript gösterimi.
- App entegrasyonu: `voice-command` eventi ile sekme/tema/arama tetiklendi.

## Test ve Performans

- Smoke: “Karanlık mod”, “Davalar”, “Ara nafaka”. Her biri <1 sn reaksiyon.
- Gürültüde yanlış algılama artabilir; kullanıcı dilediğinde dinlemeyi kapatır.
- CPU: Uzun dinleme oturumlarında düşük artış; varsayılan kapalı başlar.

## Güvenlik ve Gizlilik

- Mikrofon erişimi sadece kullanıcı onayıyla; üretimde HTTPS önerilir.
- Kişisel veri/log tutulmaz; yalnızca UI davranışı.

## Rollback

- `App.tsx`’te `<VoiceControl />` render’ını kaldırın/yorumlayın.

Son güncelleme: 2025-09-14
