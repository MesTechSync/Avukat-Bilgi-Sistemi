# Rollback Plan

Amaç: Canlıda geri dönüşün hızlı, güvenli ve izlenebilir olması.

## Strateji

- Blue/Green: Nginx root symlink ile versiyonlar arası anında geçiş
- Artifact versiyonlama: dist/ paketleri hash ve tarih ile arşivlenir
- Konfigürasyon geri dönüşü: .env dosyaları sürümlenmez, şifre kasasında tutulur

## Adımlar

1) Yeni sürümü devreye al: /var/www/app/releases/2025-09-16-136471f/
2) Sağlık kontrolü ve smoke testler
3) Sorun varsa symlink’i önceki sürüme al ve Nginx reload

## Kontrol Listesi

- [ ] Her release arşivlendi
- [ ] CHANGELOG ve versiyon etiketi oluşturuldu
- [ ] Geri dönüş komutları otomasyon scriptinde mevcut
