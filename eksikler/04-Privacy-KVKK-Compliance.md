# Privacy & KVKK Compliance

Özet: KVKK (GDPR benzeri) uyumluluk kontrolleri ve operasyonel kurallar.

## Kontrol Listesi

- [ ] Açık rıza zorunlu: ses kayıt/analiz olmadan önce onay
- [ ] Uzaktan loglama varsayılan kapalı, opt-in ve maskeli
- [ ] PII maskeleme: isim/tckn/tel/e-posta için desen tabanlı maskeler
- [ ] Supabase voice_history: RLS + row owner; IP/cihaz parmak izi yok
- [ ] Silme/unutulma talebi: UI’den tetiklenebilir, arşivler dâhil
- [ ] Amaç sınırlaması: ses verisi sadece komut analizinde kullanılır
- [ ] Saklama süresi: konfigürasyonla otomatik imha (örn. 30 gün)
- [ ] Denetim kaydı: kim, ne zaman, hangi amaç; hash’li referans

## Notlar

- TTS lokal; tarayıcı dışına veri çıkışı yok.
- Üçüncü parti servis yoksa ağ isteği olmamalı; ağ tespiti için ağ sekmesi ve test.
