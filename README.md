# ⚖️ Avukat Bilgi Sistemi – Tam Sistem Röntgeni (X-Ray)

Bu depo, avukatlara yönelik uçtan uca “AI destekli hukuk platformu”nu içerir. Önyüz (Vite + React + TypeScript) ve arka uç (FastAPI + Uvicorn) mimarisi ile; içtihat/mevzuat arama, dilekçe ve sözleşme üretimi, WhatsApp destek entegrasyonu, dosya dönüştürme (UDF ↔ DOCX/PDF/MD), sesli komutlar ve idari modüller (dava/müvekkil/randevu/finans) tek arayüzde toplanmıştır.

---

## 🧭 İçindekiler

- Özellikler (Feature Set)
- Mimari Genel Bakış
- Dizin (Directory) Yapısı
- Çalıştırma (Development & Production)
- Konfigürasyon
- API Uç Noktaları
- Günlükler (Logs)
- Dağıtım (Coolify – Git/Compose)
- Sorun Giderme (Troubleshooting)
- Yol Haritası (Roadmap)
- Lisans
- Sesli Kontrol Sistemi – Gelişmiş Analiz
- Panel Çekirdek Akış Diyagramı
- Atomik Bileşen Envanteri

## 1) Özellikler (Feature Set) ✨

- İçtihat & Mevzuat Arama (AI destekli)
  - Gerçek API bağlayıcıları: `real_api_connector.py`
  - Yargıtay, Danıştay, UYAP Emsal, Bedesten entegrasyonları (üretim ve fallback mantıkları)
  - Health: `/api/mevzuat/health`
- Dilekçe Yazım ve Sözleşme Üretimi (AI destekli metin üretimi)
- WhatsApp Destek Modülü (müşteri etkileşimi)
- Dosya Dönüştürücü (UDF ↔ DOCX/PDF/MD) – UDF altyapısı ayrı klasör altında
- Notebook LLM (deneyseldir; BETA)
- Sesli Komutlar ve Dikte
  - Gelişmiş navigasyon ve dikte kontrol event’leri
- Yönetim Modülleri
  - Dava Yönetimi, Müvekkil Yönetimi, Randevu Yönetimi, Mali İşler
- Tema ve Özelleştirme
  - Karanlık/aydınlık tema, yan menü aç/kapa, AI asistan durumu

## 2) Mimari Genel Bakış 🏗️

- Frontend: Vite + React + TypeScript (`Panel/src`)
  - Dev sunucusu: 5175 (strictPort)
  - Prod build çıktısı: `Panel/dist`
- Backend: FastAPI + Uvicorn
  - Üretim uygulaması: `Panel/panel_backend_production.py` (port 9000)
  - Alternatif giriş noktası: `Panel/panel_backend.py` (launcher; 9000)
  - Kurumsal desenler: Circuit breaker, process isolation (tools), cache (Redis veya in-memory)
  - Health (prod): `/health/production`, Swagger: `/docs`
- Geliştirme akışı:
  - Frontend dev (5175) → Vite proxy → Backend (9000)
  - Vite dev sırasında `/health` uç noktası 200 döner (dev plugin)

## 3) Dizin (Directory) Yapısı 📂

Kök (root):

- `Panel/` – Tüm aktif uygulama (frontend + backend + deploy)
  - `src/` – React kaynak kodu ve bileşenler
  - `panel_backend_production.py` – Üretim FastAPI uygulaması (port 9000)
  - `panel_backend.py` – Launcher (uvicorn ile 9000)
  - `panel_backend_enterprise.py` – Kurumsal ekler/alternatif app
  - `mevzuat_backend.py`, `mevzuat_client.py`, `mevzuat_models.py` – Mevzuat katmanı
  - `real_api_connector.py` – Gerçek API bağlayıcısı
  - `requirements.txt` – Python bağımlılıkları
  - `package.json` – Frontend script’leri ve bağımlılıklar
  - `vite.config.ts` – Dev sunucu, proxy, dev health plugin
  - `deploy/` – Nginx konfigürasyonları (Coolify için `nginx-coolify.conf`)
  - `Dockerfile.backend` / `Dockerfile.frontend` – Compose ile çoklu servis imajları
  - `dist/` – Vite prod çıktısı (build sonrası oluşturulur)
- `docker-compose.yml` – İki servisli deploy: `panel-backend` (9000), `panel-frontend` (5175→80)
- `Dockerfile` – Tek imajta build/run (alternatif dağıtım, 9001)
- `docs/` – Mimari ve dağıtım dokümantasyonu (`ARCHITECTURE.md`, `DEPLOY_COOLIFY.md`)
- `mevzuat-gov-scraper/` – Mevzuat scraping iskeleti (referans/ayrı modül)
- `.vscode/` – Geliştirme görevleri ve ayarlar

## 4) Çalıştırma (Development & Production) 🚀

### Yerel Geliştirme (ports değişmeden)

- Backend (9000):
  - Python bağımlılıkları: `cd Panel` → `python -m pip install -r requirements.txt`
  - Çalıştır: `python -m uvicorn panel_backend:app --host 0.0.0.0 --port 9000 --reload`
  - Health: `http://localhost:9000/health/production`
  - Docs: `http://localhost:9000/docs`

- Frontend (5175):
  - Node bağımlılıkları: `cd Panel` → `npm install`
  - Çalıştır: `npm run dev -- --host 0.0.0.0 --port 5175 --strictPort`
  - Sayfa: `http://localhost:5175/`

Vite proxy (vite.config.ts) varsayılan backend’i `http://localhost:9000` olarak işaret eder.

### Docker Compose ile (önerilen, prod benzeri)

Repo kökünde:

```powershell
# Gerekirse önce dev süreçlerini durdurun (5175/9000 boşta olmalı)
docker compose up -d --build

# Sağlık kontrolleri
curl http://localhost:9000/health/production
curl http://localhost:5175/ -I
```

Compose servisleri:

- panel-backend: 9000:9000 (Python 3.12-slim, `Dockerfile.backend`)
- panel-frontend: 5175:80 (Nginx, `Dockerfile.frontend`, `deploy/nginx-coolify.conf` ile /api → backend proxy)


### Tek Dockerfile ile (alternatif)

Kök `Dockerfile` çok-aşamalı build yapar (Node ile frontend build → Python 3.11 üzerinde backend). Varsayılan port 9001’dir.

```powershell
docker build -t avukat-bilgi-sistemi:latest .
docker run -p 9001:9001 avukat-bilgi-sistemi:latest
```

## 5) Konfigürasyon ⚙️

- `.env`, `.env.local`, `.env.development.local` (Panel/)
  - Frontend ortam değişkenleri: `VITE_*`
  - Backend için: Redis adresi vs. (Redis yoksa in-memory cache otomatik)
- Vite dev sağlığı: `/health` endpoint’i geliştirme sırasında 200 döner (vite plugin)
- CORS: backend dosyalarında `allow_origins` listeleri tanımlı (localhost geliştirici portları dahil).

## 6) API Uç Noktaları (Örnekler) 🔌

- Üretim Sağlık: `GET /health/production`
- Swagger: `GET /docs`
- Mevzuat Sağlık: `GET /api/mevzuat/health`
- Arama (örnek isimler): `POST /api/search/*` (gerçek bağlayıcılar: `real_api_connector.py` içinde)

Not: Tam uç nokta listesi için Swagger arayüzüne bakınız.

## 7) Günlükler (Logs) 📜

- Yerel çalışma sırasında backend log’ları: `Panel/panel_backend.log`, `panel_backend.err.log`, `panel_legal_enterprise.log`
- Prod benzeri çalıştırmada container log’larını `docker logs` ile inceleyebilirsiniz.

## 8) Dağıtım (Coolify – Git/Compose) 🧩

- Bu depo, Coolify üzerinden 2-servisli Compose dağıtımına hazırdır:
  - `docker-compose.yml`
  - `Panel/Dockerfile.backend`, `Panel/Dockerfile.frontend`
  - `Panel/deploy/nginx-coolify.conf` (SPA + /api proxy)

Özet adımlar (Coolify UI):
 
1. Yeni “Compose App” oluşturun ve bu repo’yu bağlayın.
2. Çevre değişkenlerini ihtiyaçlarınıza göre ayarlayın (Redis, domain, vb.).
3. Deploy edin. Health kontrollerini doğrulayın.

Detaylı yönergeler için: `docs/DEPLOY_COOLIFY.md`.

## 9) Sorun Giderme (Troubleshooting) 🧯

- 5175 portu doluysa: Vite dev sunucusunu başlatmadan önce portu kullanan süreçleri sonlandırın veya strictPort sayesinde başlatma hatasını görün.
- 9000 portu doluysa: Backend için aynı şekilde portu boşaltın.
- Redis yoksa: Backend otomatik olarak in-memory cache’e geçer (uyarı mesajları normaldir).
- Windows’ta PowerShell script engeli: `start-*.ps1` çalışmıyorsa, terminalden `npm run dev` / `uvicorn ...` komutlarını doğrudan kullanın.

## 10) Yol Haritası (Roadmap – Seçmeler) 🗺️

- AuthN/Z (Rol, çok-tenant, SSO)
- Üretim gözlem/telemetri (metrics, tracing)
- Gelişmiş doküman işleme (UDF katmanı ile tam akış)
- Test otomasyonu (vitest + pytest entegrasyonu ve CI)

## 11) Lisans 📝

Bu projenin lisansı (varsa) kökteki `LICENSE` dosyasında belirtilir. Üçüncü parti kütüphaneler ilgili lisanslarına tabidir.

---

## A) Sesli Kontrol Sistemi – Gelişmiş Analiz 🎙️

Bu bölüm, sesli kontrol ve dikte altyapısının uçtan uca “analiz + tasarım + kalite güvencesi” perspektifiyle derinleştirilmiş halidir. Ayrıntılı raporlar için `Panel/SES_SISTEMI_KAPSAMLI_ANALIZ_RAPORU.md` ve `Panel/SES_SISTEMI_ENTEGRASYON_RAPORU.md` belgelerine bakınız.

### A.1 Mimari Boru Hattı (Pipeline)

1) Giriş: Mikrofon → Web Audio API/VAD (Voice Activity Detection)
2) İyileştirme: Gürültü azaltma + yankı giderme + kazanç dengeleme (örn. RNNoise/WebRTC-NS/Spectral Subtraction)
3) ASR: Otomatik konuşma tanıma (online/offline konfigürasyon; düşük gecikme modları)
4) NLU/Intent: Komut/niyet çıkarımı, parametre (slot) doldurma, hata toleransı
5) Eylem: UI navigasyon, form doldurma (dikte), backend tetikleyicileri (örn. arama)
6) Geri bildirim: Sesli/ görsel onay, düzeltme döngüsü (barge-in, tekrar sor)

### A.2 Ses İyileştirme ("Ses Düzeltmesi") 🔈

- Gürültü: Statik (fan, klima) ve stokastik (kalabalık) gürültüler için adaptif filtreleme
- Yankı/Eko: AEC (Acoustic Echo Cancellation) ayarları; kulaklık/harici mikrofon optimizasyonu
- Seviyeleme: Otomatik kazanç kontrolü (AGC) + peak limiter; patlayıcı sessiz/çok yüksek sinyallerde stabilite
- VAD: Sessizlikte ASR’yi pasifleştirip gecikmeyi düşürür, bant genişliği kazanımı sağlar

Öneri: Tarayıcı tarafında WebRTC-NS + sunucu tarafında hafif post-filter kombinasyonu iyi sonuç verir.

### A.3 Bölgesel Telaffus Farklılıkları (Türkçe) 🌍

Hedef: Karadeniz/Ege/Doğu Anadolu gibi bölgesel telaffus varyantlarının komut doğruluğunu düşürmemesi.

- Fonetik Normalizasyon: Hece düşmesi/eklenmesi (örn. “gidiyom” → “gidiyorum”), ünlü daralması/genişlemesi (i/ı, o/u), ğ (yumuşak g) etkisi
- Sözlük (Lexicon) Zenginleştirme: Eş/benzer telaffuzlu anahtarlar (“menü”, “menyu”; “dosya”, “doysya”) için ek varyantlar
- N-Gram + Edit Distance: Niyet eşleştirmede fuzzy eşleme; küçük sapmalarda doğru komuta yönlendirme
- Adaptif Model: Kullanıcı bazlı kişiselleştirme (sık kullanılan komutlar için ağırlıklandırma)
- Değerlendirme: Bölgesel konuşmacı setleriyle WER/CER ölçümü; hatalı komutlar için on-the-fly düzeltme önerileri

Minimal Sözlük Şablonu (örnek):

```json
{
  "komut": "menü aç",
  "varyantlar": ["menyu aç", "menü açar mısın", "menyü aç"]
}
```

### A.4 Niyet/Kural Katmanı 🧠

- Intent → Eylem haritaları: Navigasyon (sayfa/sekme), form alanı odaklama, buton tetikleme
- Güven skoru < eşik: Kullanıcıya teyit sorusu (“Şunu mu demek istediniz…?”)
- Çakışan komutlar: Öncelik/bağlam tabanlı seçim (aktif modül, odaklanmış alan)

### A.5 Test & İzlenebilirlik ✅

- Birim: Komut sözlüğü, normalizasyon fonksiyonları, niyet eşleştirici
- Entegrasyon: Tarayıcı → Backend uçtan uca gecikme ölçümü; VAD/ASR stabilitesi
- Gözlem: Loglar (ses/komut), metrikler (erken kesme, tekrar oranı), hata örnek havuzu

---

## B) Panel Çekirdek Akış Diyagramı 🧩

Aşağıdaki şema, “Panel” içerisindeki temel kontrol akışını ve dış bağımlılıkları özetler.

```mermaid
flowchart LR
    U[👤 Kullanıcı] -->|Komut/Klik| UI[🖥️ React UI]
    UI --> RT[🧭 Router/State]
    RT -->|Fetch/Proxy| Vite[Vite Dev Server]
    Vite -->|/api/*| BE[(⚙️ FastAPI Backend)]
    BE -->|Routers| RB[📚 mevzuat_backend.py]
    BE -->|Bağlayıcı| RAC[🔌 real_api_connector.py]
    RB --> MC[🧩 mevzuat_client.py]
    MC --> EXT{{🏛️ Yargıtay/Danıştay/EMSAL/Bedesten}}
    BE -->|Cache| C[(🗃️ Redis/In-Memory)]
    BE --> LOG[(📜 Logs)]
    subgraph Deploy
      NGX[Nginx (Coolify)] -->|/api → 9000| BE
      NGX -->|/ → 80| FE[(🗂️ Build/Static)]
    end
    UI -.Voice/Dikte.-> ASR[(🎙️ ASR/NLU Katmanı)]
    ASR -.Intent.-> RT
```

Notlar:

- Geliştirmede Vite proxy, üretimde Nginx proxy kullanılır.
- Cache katmanı Redis varsa tercih edilir, yoksa in-memory yedek devrededir.
- Voice/ASR katmanı projeye entegrasyon noktasını temsil eder (tarayıcı ve/veya sunucu tarafı).

---

## C) Atomik Bileşen Envanteri 🔬

Bu bölüm, “Panel/” altındaki önemli dosya ve modülleri işlevleriyle birlikte atomik seviyede listeler.

### Backend (Python/FastAPI)

- `panel_backend_production.py`: Üretim FastAPI uygulaması; health `/health/production`, Swagger `/docs`.
- `panel_backend.py`: Uvicorn launcher (dev); 9000 portu; reload amaçlı basit giriş noktası.
- `panel_backend_enterprise.py`: Circuit breaker, process isolation, caching gibi kurumsal desenlerin referans uygulaması.
- `mevzuat_backend.py`: Mevzuat ile ilgili API uçları ve koordinasyon.
- `mevzuat_client.py`: Dış servis istemcileri; request/response şemaları.
- `mevzuat_models.py`: Veri modelleri (Pydantic) ve tipler.
- `real_api_connector.py`: Yargıtay/Danıştay/EMSAL/Bedesten gerçek çağrıları; hata/fallback yönetimi.
- `requirements.txt`: Python bağımlılık sabitlemesi.
- Log dosyaları: `panel_backend.log`, `panel_backend.err.log`, `panel_backend.prod.*`, `panel_legal_enterprise.log` (gözlem/teşhis için).
- Testler: `test_mevzuat_api_only.py`, `test_mevzuat_collection.py`, `simple_test.py` (örnek/iskelet)

Diğer yardımcılar:

- `backend.py`, `debug_mevzuat.py`: Geliştirme/test yardımcı scriptleri.
- `scripts/`, `supabase/`: Yardımcı scriptler ve harici servis entegrasyonu (mevcutsa) için yapılandırmalar.

### Frontend (Vite/React/TS)

- `src/`: Sayfa ve bileşenler; durum yönetimi; hizmet katmanları (API çağrıları).
- `index.html`: Uygulama iskeleti; meta ve kök düğüm.
- `vite.config.ts`: Dev server 5175, strictPort, proxy ayarları, dev health plugin.
- `package.json`: Scriptler ve bağımlılıklar.
- `dist/`: Prod build çıktıları (Nginx ile servis edilir).

### Dağıtım/Altyapı

- `docker-compose.yml`: İki servis (panel-backend:9000, panel-frontend:5175→80); Coolify-uyumlu.
- `Panel/Dockerfile.backend`: Python 3.12-slim; backend servis imajı.
- `Panel/Dockerfile.frontend`: Node build + Nginx; frontend servis imajı.
- `Panel/deploy/nginx-coolify.conf`: SPA fallback + `/api` proxy; health endpoint.
- Kök `Dockerfile`: Tek-imaj alternatif (varsayılan port 9001).

### Ses Sistemi Belgeleri

- `Panel/SES_SISTEMI_KAPSAMLI_ANALIZ_RAPORU.md`: Kapsamlı analiz ve öneriler.
- `Panel/SES_SISTEMI_ENTEGRASYON_RAPORU.md`: Entegrasyon adımları ve testler.

