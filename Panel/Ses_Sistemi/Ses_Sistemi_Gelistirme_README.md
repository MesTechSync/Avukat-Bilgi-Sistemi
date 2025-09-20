# Avukat Bilgi Sistemi — Ses Sistemi Geliştirme (MVP)

Bu doküman, hukuk odaklı uygulamadaki sesli kontrol MVP’sinin geliştirme sınırlarını ve küçük yol haritasını tanımlar.

## Kapsam (MVP)

- Tema kontrolü: “Karanlık mod”, “Aydınlık mod”.
- Navigasyon: “Ana sayfa”, “Davalar”, “Müvekkiller”, “Takvim”, “Ayarlar”.
- Arama: “Ara …” kalıbı ile arama sekmesine geçiş + parametre üretimi.
- Destek yoksa sessiz devre dışı (UI gizli, uygulama normal çalışır).

## Mimari Notlar

- Web Speech API tabanlı, ek paket yok; React bileşen: `VoiceControl`, kanca: `useVoiceControl`, çekirdek: `voiceSystem.ts`.
- Niyet analizi basit anahtar kelime eşleşmesine dayanır; olay: `voice-command` ile uygulamaya aktarılır.
- Koyu/açık tema pre-paint betiğiyle FOUC önlenir; Tailwind `darkMode: 'class'`.

## Test Kısa Rehberi

1. “Karanlık mod” → koyu tema; “Aydınlık mod” → açık tema.
1. “Davalar” → Davalar sekmesi; “Müvekkiller” → Müvekkiller sekmesi.
1. “Ara nafaka” → arama sekmesi ve parametre dolu.

## Geliştirme Backlog’u (Düşük Riskli)

- Intent testleri: `analyzeIntent` için birim testi (mutlu yol + 1-2 kenar).
- UI geri bildirimleri: son komut/niyet badge’i (ekran okuyucuya uygun).
- Telemetri: yalnızca sayım/anonim metrik (komut kategorisi, başarı/başarısızlık).

## Rollback

- `App.tsx`’te `<VoiceControl />` render’ını geçici olarak kaldırın/yorumlayın.

Son güncelleme: 2025-09-14
