# QA Test Plan

Kapsam: Birim, entegrasyon ve E2E duman testleri.

## Birim Testleri

- Analyzer: LIST önceliği, param çıkarımı, eşik davranışı
- VoiceManager: event yayını, dil ayarı
- Dictation: normalizasyon, bastırma, default hedef

## Entegrasyon Testleri

- App.tsx dispatcher: NAV/LIST/SEARCH/THEME/DICTATE_* akışları
- Sayfa dinleyicileri: list-filter/sort etkileri

## E2E (Smoke)

- Build sonrası temel rota geçişleri
- Ses başlat/durdur ve tek komut örnekleri
- Dikte kaydet ile form submit
