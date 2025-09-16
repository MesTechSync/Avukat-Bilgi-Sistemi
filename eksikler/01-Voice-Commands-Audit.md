# Voice Commands Audit

Özet: Sesli komutların kapsamı, haritaları, olay sözleşmeleri ve boşluklar.

## Kapsam ve Sözleşmeler

- Event: `voice-command` payload: `{ type, page?, params?, raw }`
- Dictation: `voice-dictation` (metin), `voice-dictation-save` (submit)
- LIST önce-NAV sonra kuralı; düşük/orta/yüksek eşiklerle fuzzy+fonetik.

## Komut Grupları

- NAV_…: dashboard, cases, clients, appointments, financials, settings, ai-assistant, petition-writer, contract-generator, whatsapp, file-converter, profile
- SEARCH: gelişmiş arama ve sayfa içi arama
- LIST_FILTER/LIST_SORT: durum/öncelik/tür; ada göre artan/azalan
- THEME: açık/koyu
- DICTATE_*: start/stop/save global

## Test Matrisi (örnek)

- “dava listesi” -> LIST_FILTER {page: cases}
- “müvekkil ara ali veli” -> SEARCH {q: "ali veli"}
- “dilekçe yazarı” -> NAV_PETITION_WRITER
- “sözleşme oluştur” -> NAV_CONTRACT_GENERATOR

## Boşluklar / Aksiyonlar

- [ ] Tarih/saat/ücret bazlı filtreler (range + rozet)
- [ ] Financials sayfası için LIST_* parametreleri
- [ ] Çok kelimeli NAV eş anlamlıları genişletme
- [ ] Türkçe telaffuz varyant sözlüğünü büyütme
