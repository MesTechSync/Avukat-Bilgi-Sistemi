# Avukat Bilgi Sistemi — Ses Sistemi İyileştirme Özeti (MVP)

Bu belge, kapsamlı eğitim/MEB odaklı içeriği kaldırıp hukuk uygulaması için geçerli minimal sesli kontrol iyileştirmelerini özetler.

## MVP Kapsamı

- Tema: “Karanlık mod”, “Aydınlık mod”.
- Navigasyon: “Ana sayfa”, “Davalar”, “Müvekkiller”, “Takvim”, “Ayarlar”.
- Arama: “Ara …” → arama sekmesi + parametre.
- Destek yoksa sessiz devre dışı: UI gizli, uygulama normal akışta.

## Teknik Notlar

- Web Speech API; `VoiceControl` bileşeni, `useVoiceControl` kancası, `voiceSystem.ts` çekirdeği.
- Intent analizi anahtar kelime eşleşmesi; `voice-command` event ile App tarafına aktarım.
- Tailwind `darkMode: 'class'`; pre-paint betiği ile FOUC engellenir.

## Doğrulama ve Performans

- Build PASS, güvenlik PASS (0 zafiyet). Vite prod build sorunsuz.
- Hızlı test: Tema komutları <1 sn; sekme geçişleri <1 sn; “Ara …” parametre üretimi çalışır.

## Rollback

- `App.tsx` içindeki `<VoiceControl />` render’ını geçici olarak kaldırın/yorumlayın.

Son güncelleme: 2025-09-14
