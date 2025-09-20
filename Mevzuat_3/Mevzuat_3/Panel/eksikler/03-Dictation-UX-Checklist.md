# Dictation UX Checklist

Amaç: Dikte davranışının her form ve arama alanında kusursuz çalıştığını doğrulamak.

## Kurallar

- Varsayılan hedef: odaktaki input/textarea/contenteditable; yoksa `[data-dictation-default]`
- Noktalama normalizasyonu; komut cümlesini ilk satırdan ayırma
- `voice-dictation-save`: en yakın form submit veya `[data-dictation-save]` tıkla

## Kontrol Listesi

- [ ] Cases: arama inputu ve “Dava Başlığı” işaretli
- [ ] Clients: arama inputu ve “Ad Soyad” işaretli
- [ ] Appointments: arama ve “Randevu Başlığı” işaretli
- [ ] Petition/Contract: Kaydet butonu `data-dictation-save`; içerik varsa localStorage’a yaz
- [ ] AdvancedSearch: toggle ve input default
- [ ] Komut bastırma: son komut metni tekrar alanlara eklenmez
