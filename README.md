# Avukat Bilgi Sistemi (Yeni Sistem)

Bu depo yeni sistem için güncellenmiştir. Eski mimari/alt sürümler dikkate alınmaz. Panel (Vite + React) önyüzünü derler ve FastAPI (Uvicorn) arka uç ile aynı konteynerde servis eder.

## Hızlı Başlangıç

- Yerel geliştirme (Windows):
  - Backend (port 9001): `cd Panel` → `python panel_backend_production.py`
  - Frontend dev (port 5175): `cd Panel` → `npm run dev`
  - Sağlık: `http://localhost:9001/health/production`
  - Docs: `http://localhost:9001/docs`

- Docker ile (prod benzeri):
  1. Proje kökünde: `docker build -t avukat-bilgi-sistemi:latest .`
  2. Çalıştır: `docker run -p 9001:9001 avukat-bilgi-sistemi:latest`
  3. Test: `http://localhost:9001/` (SPA), `http://localhost:9001/docs`

## Mimarinin Özeti

- Frontend: Vite + React + TypeScript → build çıktısı `Panel/dist`
- Backend: FastAPI (`Panel/panel_backend_production.py`), Uvicorn 9001
- Statik servis: Backend, `Panel/dist` içeriğini `/` altında yayınlar
- Ek klasörler: `mevzuat-gov-scraper`, `Mevzuat-System`

Detaylı mimari için `docs/ARCHITECTURE.md` dosyasına bakınız.

## Coolify Üzerinden Dağıtım

- Domain: <https://avukat-bilgi-sistemi.hidlightmedya.tr/>
- Deploy stratejisi: Dockerfile ile tek imajta frontend build + backend servis
- Coolify ayarları için `docs/DEPLOY_COOLIFY.md` dosyasına bakınız.

## Bağımlılıklar

- Python: `Panel/requirements.txt`
- Node: `Panel/package.json`

## Sağlık ve Gözlem

- Health endpoint: `/health/production`
- Stats endpoint: `/api/stats/production`
- Loglar (Windows yerel): `Panel/panel_backend.prod.log` ve `.err.log`

## Lisans

Proje lisansı ve telif hakları; bu deponun lisans dosyasında (varsa) belirtilir.
