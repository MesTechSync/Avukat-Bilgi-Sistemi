# 🏛️ Avukat Bilgi Sistemi (Enterprise)

Hukuk büroları ve kurumsal hukuk ekipleri için geliştirilen, modern bir React + Vite tabanlı ön yüz ve isteğe bağlı tek-port yerel backend ile çalışan bir yönetim platformu.

## 🚀 Özellikler

- React 18 + Vite 7 ile hızlı ve modern SPA
- TailwindCSS ile responsive arayüz
- Supabase (Auth, Postgres, Storage, Realtime) entegrasyonu
- Docker + Nginx prod mimarisi, Coolify ile otomatik deploy
- Domain tabanlı erişim ve güvenlik başlıkları
- Tek porttan çalışan yerel backend (opsiyonel): WhatsApp, UDF dönüştürücü, Notebook LLM (Gemini), Mevzuat/Yargı arama

## 🏗️ Mimarî

İstemci (React SPA) -> Nginx (statik servis) -> Supabase REST/Auth/Realtime -> PostgreSQL

Yerel geliştirme için opsiyonel tek-port Express sunucu: Panel (statik veya Vite dev) + API'ler aynı porttan servis edilir.

## 📦 Proje Yapısı

- `Panel/` React/Vite ön yüz uygulaması
- `server/` Tek-port Express sunucu (WhatsApp, UDF, Notebook LLM, Mevzuat/Yargı arama)
- `Dockerfile` Production imajı (Node 20 build, Nginx serve)
- `nixpacks.toml` Nixpacks yapılandırması (alternatif build)
- `package.json` Kök yönlendirici scriptler
- `start-oneport.ps1` Yerel tek-port sunucu için kolay başlatma scripti

## 🔧 Kurulum (Local)

1) Gereksinimler: Node.js 20+, npm 10+, Git
2) Panel’i kur ve çalıştır (yalnızca ön yüz geliştirme):
	- `cd Panel`
	- `npm install`
	- `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun
	- Çalıştır: `npm run dev`

### Opsiyonel: Tek Port Yerel Sunucu (Panel + API)

Statik Panel varsa (Panel/dist mevcut), tek porttan başlatın:

```powershell
# Kolay başlatma: Panel'i build eder, server'ı tek portta açar
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Mevzuat\start-oneport.ps1 -Port 8000 -BindHost localhost
```

Tarayıcı: <http://localhost:8000>  • Sağlık: <http://localhost:8000/health>

Geliştirme (Vite açık, HMR):

```powershell
# Vite ile geliştirme (isteğe bağlı)
$env:ENABLE_VITE = '1'; $env:PORT = '8000'; $env:HOST = 'localhost'; node .\server\server.js
```

Panel’i derlemek (statik servis için):

```powershell
cd Panel
npm ci
npm run build
```

## ⚙️ Server Ortam Değişkenleri

`server/.env.example` dosyasını referans alın:

- `PORT` (örn. 8000) • `HOST` (örn. 127.0.0.1)
- `ENABLE_VITE` = 0 (statik) / 1 (Vite dev)
- İleri düzey arama/OCR için opsiyoneller: `ENABLE_FTS`, `ENABLE_OCR`, `ENABLE_PDF_OCR`, `MEILISEARCH_URL`, `MEILISEARCH_API_KEY`

## 🔐 Panel Environment Variables

- `VITE_SUPABASE_URL` (zorunlu)
- `VITE_SUPABASE_ANON_KEY` (zorunlu)
- `VITE_BACKEND_URL` (opsiyonel)

`Panel/.env.example` içinde örnekler mevcut.

 
## 🌐 Deployment (Coolify)

Tek container, tek port modeli ile Dockerfile kullanılır:

- Branch: `main` (veya `fix-one-port-4001` PR birleşene kadar)
- Build: Dockerfile (Node 20) Panel’i build eder ve Node/Express runtime’da hem Panel’i hem API’yi 8000’den servis eder.
- Service Port: 8000
- Healthcheck: /health
- Env vars (runtime): HOST=0.0.0.0, PORT=8000, ENABLE_VITE=0
- Env vars (build, opsiyonel): VITE_BACKEND_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

Coolify adımları:

1) New App -> Repo -> Branch seçin
2) Service Port = 8000, Healthcheck path = /health
3) Deploy; yeşil olduktan sonra domain/SSL’i bağlayın

## 🧪 Test & Sağlık Kontrolleri

- Build doğrulama: `cd Panel && npm run build`
- Smoke test: sitenin ana sayfası 200 dönmeli
- Health endpoint (tek-port backend): `/health`

## 🔌 Yerel API Uç Noktaları (özet)

- GET `/health` → { status: "ok" }
- WhatsApp: `/wa/status`, `/wa/qr`, `/wa/logout`, `/wa/chats`, `/wa/messages`, `/wa/send`
- UDF dönüştürme: POST `/api/convert-udf` (multipart `file`)
- Mevzuat/Yargı Arama: `/legal` (mini UI), `/legal/search`, `/legal/doc`, `/legal/index-status`, `/legal/reindex`

## 🛡️ Güvenlik

- HTTPS zorunlu (Coolify/Proxy ile)
- Nginx security headers
- Supabase RLS politikaları önerilir

## 📜 Lisans

MIT

## 🤖 AI Komut Şablonu

- Hukuk odaklı şablon: `AI_COMMAND_TEMPLATE_v3.md`
