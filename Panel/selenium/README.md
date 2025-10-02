# UYAP ve Yargıtay Karar Arama Sistemleri Veri Çekme Aracı

Bu proje, Türkiye'deki resmi karar arama sistemlerinden yasal sınırlar içinde veri çekmek için geliştirilmiştir.

## ⚠️ ÖNEMLİ UYARILAR

- Bu araçlar sadece **yasal ve etik sınırlar içinde** kullanılmalıdır
- Site kullanım koşullarına mutlaka uyulmalıdır
- Rate limiting (istek sınırlaması) uygulanmıştır
- Kişisel veri koruma kurallarına dikkat edilmelidir

## Desteklenen Sistemler

1. **UYAP Emsal Karar Arama**: https://emsal.uyap.gov.tr/
2. **Yargıtay Karar Arama**: https://karararama.yargitay.gov.tr/

## Kurulum

```bash
# Gerekli kütüphaneleri yükleyin
pip install -r requirements.txt
```

## Kullanım

### UYAP Emsal Karar Arama

```python
from uyap_scraper import UYAPScraper

scraper = UYAPScraper()

# Karar arama
results = scraper.search_decisions(
    keyword="tazminat",
    date_from="01-01-2023",
    date_to="31-12-2023",
    limit=100
)

# Sonuçları kaydet
scraper.save_to_csv(results)
scraper.save_to_json(results)
```

### Yargıtay Karar Arama

```python
from yargitay_scraper import YargitayScraper

scraper = YargitayScraper()

# Mevcut daireleri listele
departments = scraper.get_departments()

# Karar arama
results = scraper.search_decisions(
    keyword="tazminat",
    department="1",  # 1. Hukuk Dairesi
    date_from="01-01-2023",
    date_to="31-12-2023",
    limit=100
)

# Sonuçları kaydet
scraper.save_to_csv(results)
scraper.save_to_json(results)
```

## Özellikler

- ✅ Rate limiting (istek sınırlaması)
- ✅ Hata yönetimi ve loglama
- ✅ CSV ve JSON formatında veri kaydetme
- ✅ Detaylı karar metni çekme
- ✅ Yasal uyumluluk kontrolleri

## Yasal Uyumluluk

Bu araçlar aşağıdaki prensiplere uygun olarak geliştirilmiştir:

1. **Kullanım Koşulları**: İlgili sitelerin kullanım koşullarına uyum
2. **Rate Limiting**: Sunuculara aşırı yük bindirmemek için istek sınırlaması
3. **Veri Gizliliği**: Kişisel veri koruma kurallarına uyum
4. **Etik Kullanım**: Sadece yasal amaçlar için kullanım

## Teknik Detaylar

- **Python 3.7+** gereklidir
- **requests** ve **BeautifulSoup** kütüphaneleri kullanılır
- **Selenium** alternatif olarak JavaScript tabanlı arayüzler için
- **Logging** sistemi ile işlem takibi

## Sorun Giderme

1. **Site yapısı değişiklikleri**: Kodlar sitenin güncel yapısına göre güncellenmelidir
2. **Rate limiting**: İstekler arasında bekleme süreleri artırılabilir
3. **Proxy kullanımı**: Gerekirse proxy ayarları eklenebilir

## Katkıda Bulunma

Bu proje açık kaynak olarak geliştirilmiştir. Katkılarınızı bekliyoruz:

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.
