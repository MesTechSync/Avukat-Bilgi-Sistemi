# Deployment & Go-Live Checklist

Hedef: Nginx üzerinden statik yayın; /health endpoint.

## Önkoşullar

- [ ] .env.production dolduruldu (API_URL, SUPABASE_URL, SUPABASE_ANON_KEY, PRIVACY_FLAGS)
- [ ] Vite build: `npm run build`
- [ ] dist/ içeriği Nginx root’a kopyalandı
- [ ] Nginx conf: gzip, caching headers, SPA fallback, /health 200 (bkz. `Panel/deploy/nginx.conf`)
- [ ] Güvenlik başlıkları uygulandı: CSP (script-src 'self'), HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy no-referrer (bkz. `Panel/deploy/nginx.conf`)
- [ ] SSL (Let’s Encrypt) ve HTTP->HTTPS yönlendirme
- [ ] Log/monitoring: uptime, frontend error (Sentry/alternatif), Nginx access

## Smoke Testler

- [ ] Ana sayfa açılıyor, konsol hatası yok
- [ ] Ses başlat/durdur çalışıyor, izin akışı başarılı
- [ ] NAV komutları tüm sayfaları açıyor
- [ ] LIST filtre/rozetler çalışır
- [ ] Dikte kaydet formu gönderiyor

## Rollback

- [ ] Önceki build arşivli; Nginx symlink ile geri dönüş 1 komut (bkz. 13-Rollback-Plan.md)
- [ ] Versiyon etiketleri ve CHANGELOG güncel
