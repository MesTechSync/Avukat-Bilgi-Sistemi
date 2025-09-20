# Avukat Bilgi Sistemi – Tam Sistem Röntgeni (X-Ray)

Bu depo, avukatlara yönelik uçtan uca “AI destekli hukuk platformu”nu içerir. Önyüz (Vite + React + TypeScript) ve arka uç (FastAPI + Uvicorn) mimarisi ile; içtihat/mevzuat arama, dilekçe ve sözleşme üretimi, WhatsApp destek entegrasyonu, dosya dönüştürme (UDF ↔ DOCX/PDF/MD), sesli komutlar ve idari modüller (dava/müvekkil/randevu/finans) tek arayüzde toplanmıştır.

## 1) Özellikler (Feature Set)

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

## 2) Mimari Genel Bakış

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

## 3) Dizin (Directory) Yapısı

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

## 4) Çalıştırma (Development & Production)

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

## 5) Konfigürasyon

- `.env`, `.env.local`, `.env.development.local` (Panel/)
  - Frontend ortam değişkenleri: `VITE_*`
  - Backend için: Redis adresi vs. (Redis yoksa in-memory cache otomatik)
- Vite dev sağlığı: `/health` endpoint’i geliştirme sırasında 200 döner (vite plugin)
- CORS: backend dosyalarında `allow_origins` listeleri tanımlı (localhost geliştirici portları dahil).

## 6) API Uç Noktaları (Örnekler)

- Üretim Sağlık: `GET /health/production`
- Swagger: `GET /docs`
- Mevzuat Sağlık: `GET /api/mevzuat/health`
- Arama (örnek isimler): `POST /api/search/*` (gerçek bağlayıcılar: `real_api_connector.py` içinde)

Not: Tam uç nokta listesi için Swagger arayüzüne bakınız.

## 7) Günlükler (Logs)

- Yerel çalışma sırasında backend log’ları: `Panel/panel_backend.log`, `panel_backend.err.log`, `panel_legal_enterprise.log`
- Prod benzeri çalıştırmada container log’larını `docker logs` ile inceleyebilirsiniz.

## 8) Dağıtım (Coolify – Git/Compose)

- Bu depo, Coolify üzerinden 2-servisli Compose dağıtımına hazırdır:
  - `docker-compose.yml`
  - `Panel/Dockerfile.backend`, `Panel/Dockerfile.frontend`
  - `Panel/deploy/nginx-coolify.conf` (SPA + /api proxy)

Özet adımlar (Coolify UI):
 
1. Yeni “Compose App” oluşturun ve bu repo’yu bağlayın.
2. Çevre değişkenlerini ihtiyaçlarınıza göre ayarlayın (Redis, domain, vb.).
3. Deploy edin. Health kontrollerini doğrulayın.

Detaylı yönergeler için: `docs/DEPLOY_COOLIFY.md`.

## 9) Sorun Giderme (Troubleshooting)

- 5175 portu doluysa: Vite dev sunucusunu başlatmadan önce portu kullanan süreçleri sonlandırın veya strictPort sayesinde başlatma hatasını görün.
- 9000 portu doluysa: Backend için aynı şekilde portu boşaltın.
- Redis yoksa: Backend otomatik olarak in-memory cache’e geçer (uyarı mesajları normaldir).
- Windows’ta PowerShell script engeli: `start-*.ps1` çalışmıyorsa, terminalden `npm run dev` / `uvicorn ...` komutlarını doğrudan kullanın.

## 10) Yol Haritası (Roadmap – Seçmeler)

- AuthN/Z (Rol, çok-tenant, SSO)
- Üretim gözlem/telemetri (metrics, tracing)
- Gelişmiş doküman işleme (UDF katmanı ile tam akış)
- Test otomasyonu (vitest + pytest entegrasyonu ve CI)

## 11) Lisans

Bu projenin lisansı (varsa) kökteki `LICENSE` dosyasında belirtilir. Üçüncü parti kütüphaneler ilgili lisanslarına tabidir.
