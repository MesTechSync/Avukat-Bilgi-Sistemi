# Açıklar ve Vulnerabilities Raporu

Amaç: Güvenlik açıkları, eksikler ve çözüm önerilerini toplamak.

## Güvenlik (Uygulama)

- [ ] XSS yüzeyi: Dikte edilen metin ve template çıktıları sanitize edilmeli (DOMPurify önerilir)
- [ ] CSRF riski: Form gönderimlerinde token ve same-site cookie stratejisi
- [ ] LocalStorage gizlilik: KVKK’ya uygun maskeleme ve süresi dolan anahtarlar
- [ ] Üçüncü parti script yok/var kontrolü; supply‑chain riski

## Güvenlik (API / Supabase)

- [ ] RLS politikaları: sadece owner erişimi; row‑level kısıtlar test edilmeli
- [ ] Auth token sızıntısı: URL, log ve client storage’ta sızıntı testi
- [ ] Rate limiting ve abuse koruması: edge function/proxy katmanı
- [ ] Storage bucket politikaları: private varsayılan; imzalı URL süre sınırı

## Build/Dağıtım

- [ ] Sürümleme ve imza: Artifact’lar hash ile doğrulanmalı
- [ ] Nginx başlıkları: CSP, HSTS, X‑Frame‑Options, X‑Content‑Type‑Options
- [ ] Healthcheck ve readiness: /health ve statik varlık erişimi

## İzleme ve Olay Müdahalesi

- [ ] İstemci hata izleme (Sentry/alternatif); PII maskeleme
- [ ] Uptime/probe alarmları; threshold ve rota bazlı durum
- [ ] Olay günlükleri: KVKK’ya uygun tutulmalı; silme/anonimleştirme akışı

## Açık İşler

- [ ] DOM sanitization kütüphanesi ekle ve tüm riskli render noktalarında uygula
- [ ] RLS ve bucket politikalarını kod/test ile doğrula
- [ ] Nginx güvenlik başlıkları konfigüre et ve test et
