# System Audit (Exec Summary)

Bu rapor; mimari özet, bileşenler ve mevcut fonksiyon durumunu sunar.

## Mimari

- İstemci: React 18 + Vite, TailwindCSS; SPA + Nginx static
- Ses: Web Speech API; tekil VoiceManager; Event tabanlı entegrasyon
- Rota/Sayfalar: Dashboard, Cases, Clients, Appointments, Financials, Settings, AI, Petition, Contract, WhatsApp, Converter, Profile
- Gizlilik: KVKK onay, opt-in log, PII maskeleme; Supabase voice_history (RLS)
- Test: Vitest birim + E2E smoke

## Durum Özeti

- Sesli komut: LIST > NAV önceliği, fuzzy/phonetic; geniş komut sözlüğü
- Dikte: odak + default hedef; `voice-dictation-save` ile form submit
- UI: Filtre/sort rozetleri; silme onayı + geri alma; a11y iyileştirmeleri
- Dağıtım: Prod build doğrulandı; Nginx hedefi; /health endpoint planlı

## Açık İşler (kısa)

- Financials için LIST parametreleri ve rozetler
- Petition/Contract kalıcı kayıt (Supabase), depolama ve PDF
- Genişletilmiş tarih/tutar filtreleri
- İzleme/geri dönüş stratejisi (error tracking + uptime)
