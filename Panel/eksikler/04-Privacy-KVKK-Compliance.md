# Privacy & KVKK Compliance

Özet: KVKK (GDPR benzeri) uyumluluk kontrolleri ve operasyonel kurallar.

## Kontrol Listesi

- [ ] Açık rıza zorunlu: ses kayıt/analiz olmadan önce onay
- [x] Uzaktan loglama varsayılan kapalı, opt-in ve maskeli (CONFIG.PRIVACY)
- [ ] PII maskeleme: isim/tckn/tel/e-posta için desen tabanlı maskeler
- [ ] Supabase voice_history: RLS + row owner; IP/cihaz parmak izi yok (owner‑based RLS migration eklendi, frontend kayıtları KVKK onayı + opt‑in log ile ve yerel kuyrukla yönetiliyor; entegrasyon testi tamamlanmalı)

## OAuth doğrulama (Clerk / MCP Auth)

Amaç: Mock token yok; yalnızca gerçek kimlik sağlayıcı (IdP) kanıtı ile token akışına izin verilir. Bu, üretimta KVKK ve güvenlik gereksinimleri için zorunludur.

- /.well-known uçları mevcut: `/.well-known/oauth-authorization-server` ve `/.well-known/oauth-protected-resource` doğru metadata döner.

- /authorize:
  - Clerk modülü yoksa 500 döner (yanlış yapılandırma). Varsa Clerk sign-in sayfasına yönlendirir.
  - `state` içerisine `original_state:session_id` birleşik değer yazılır; PKCE verifier sunucuda saklanır.

- /auth/callback:
  - Kanıtsız (ne JWT ne de Clerk `__session` çerezi) istekler için 401 `invalid_grant` döner.
  - JWT kanıtı sağlanırsa imza doğrulaması olmadan yalnızca claim varlığı (sub/user_id) kontrol edilir ve kullanıcı kimliği session’a yazılır. İmzalı doğrulama ve token takası IdP tarafında yapılmalıdır.
  - Başarılı durumda yetkilendirme kodu üretilir ve istemcinin `redirect_uri` adresine `code` ve `state` ile yönlendirilir.

- /token:
  - Mock/dummy token asla verilmez. IdP ile gerçek takas implementasyonu yoksa 401 `invalid_grant` döner.

Hızlı denetim kontrol listesi:

- [ ] /authorize 302 ile Clerk alanına yönlendiriyor mu?
- [ ] /auth/callback kanıt yoksa 401; JWT veya cookie varsa yönlendiriyor mu?
- [ ] /token mock vermiyor, gerçek IdP gerektiriyor mu?

Not: Bu proje, demo mod ve sahte token desteğini kaldırmıştır; üretimta yalnızca gerçek IdP kabul edilir.

## Nginx CSP ve güvenlik başlıkları doğrulama

`Panel/deploy/nginx.conf` içinde aşağıdaki güvenlik başlıkları yapılandırılmıştır:

- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy

Kontrol listesi:

- [ ] /health 200 dönüyor mu?
- [ ] Üretim ortamında yanıt başlıkları yukarıdaki değerleri içeriyor mu?
- [ ] CSP ihlali yok mu (konsol uyarıları) ve gerekli alan adları allowlist’te mi?

## Supabase RLS hızlı testleri (voice_history)

Hedef: `voice_history` tablosunda satır bazında sahiplik (owner) uygulanıyor ve başka kullanıcıların kayıtlarına erişilemiyor.

Önerilen adımlar:

1. İki farklı kullanıcı ile giriş yapın; her kullanıcı birer `voice_history` kaydı oluştursun.
2. Kullanıcı A, Kullanıcı B’nin kayıtlarını listeleyememeli; yalnızca kendi kayıtlarını görmeli.
3. RLS politikaları migration dosyalarında etkinleştirilmiştir (owner sütunu ile). Supabase Policy sayfasından politikaların etkin olduğunu doğrulayın.

Başarılı sonuç: Her kullanıcı yalnızca kendi verilerine erişir, cross-tenant veri sızıntısı yoktur.

- [ ] Silme/unutulma talebi: UI’den tetiklenebilir, arşivler dâhil
- [ ] Amaç sınırlaması: ses verisi sadece komut analizinde kullanılır
- [ ] Saklama süresi: konfigürasyonla otomatik imha (örn. 30 gün)
- [ ] Denetim kaydı: kim, ne zaman, hangi amaç; hash’li referans

## Notlar

- TTS lokal; tarayıcı dışına veri çıkışı yok.
- Üçüncü parti servis yoksa ağ isteği olmamalı; ağ tespiti için ağ sekmesi ve test.
