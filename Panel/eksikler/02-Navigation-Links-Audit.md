# Navigation & Links Audit

Amaç: Menü ve router üzerindeki tüm sayfaların ses/NAV komutları ve manuel linklerle açılabildiğini doğrulamak.

## Sayfalar

- Dashboard (/)
- Cases (/cases)
- Clients (/clients)
- Appointments (/appointments)
- Financials (/financials)
- Settings (/settings)
- AI Assistant (/ai)
- Petition Writer (/petition)
- Contract Generator (/contract)
- WhatsApp Integration (/whatsapp)
- File Converter (/convert)
- Profile (/profile)

## Kontroller

- [ ] Her sayfa için NAV_* komutu mevcut ve App.tsx dispatch bağlı
- [ ] Menü öğesi / Link mevcut; kırık link yok
- [ ] 404 fallback çalışıyor; bilinmeyen rotalar redirect
- [ ] Başlık ve breadcrumb doğru
- [ ] A11y: odak halkası, tek ana sayfa başlığı (seviye 1), landmark’lar
