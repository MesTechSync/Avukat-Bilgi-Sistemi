# 🏛️ Avukat Bilgi Sistemi (Enterprise)

Hukuk büroları ve kurumsal hukuk ekipleri için geliştirilen, modern bir React + Vite tabanlı ön yüz ve Supabase arka hizmetleri ile çalışan bir yönetim platformu.

## 🚀 Özellikler

- React 18 + Vite 7 ile hızlı ve modern SPA
- TailwindCSS ile responsive arayüz
- Supabase (Auth, Postgres, Storage, Realtime) entegrasyonu
- Docker + Nginx prod mimarisi, Coolify ile otomatik deploy
- Domain tabanlı erişim ve güvenlik başlıkları

## 🏗️ Mimarî

İstemci (React SPA) -> Nginx (statik servis) -> Supabase REST/Auth/Realtime -> PostgreSQL

## 📦 Proje Yapısı

- `Panel/` React/Vite ön yüz uygulaması
- `Dockerfile` Production imajı (Node 20 build, Nginx serve)
- `nixpacks.toml` Nixpacks yapılandırması (alternatif build)
- `package.json` Kök yönlendirici scriptler

## 🔧 Kurulum (Local)

1) Gereksinimler: Node.js 20+, npm 10+, Git
2) Klonla ve kur:
	- `cd Panel`
	- `npm install`
	- `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri doldurun
3) Çalıştır: `npm run dev`

## 🔐 Environment Variables

- `VITE_SUPABASE_URL` (zorunlu)
- `VITE_SUPABASE_ANON_KEY` (zorunlu)
- `VITE_BACKEND_URL` (opsiyonel)

`Panel/.env.example` içinde örnekler mevcut.

## 🌐 Deployment (Coolify)

- Branch: `main`
- Build: Dockerfile (önerilir) veya Nixpacks
- Node: 20.x
- Ortam değişkenlerini Coolify Environment bölümüne ekleyin
- Domain izinleri için:
	- `vite.config.ts` içinde `preview.allowedHosts` listesinde domain mevcut
	- Nginx `server_name` Dockerfile’da yapılandırıldı

## 🧪 Test & Sağlık Kontrolleri

- Build doğrulama: `cd Panel && npm run build`
- Smoke test: sitenin ana sayfası 200 dönmeli
- Health endpoint (opsiyonel backend varsa): `/health`

## 🛡️ Güvenlik

- HTTPS zorunlu (Coolify/Proxy ile)
- Nginx security headers
- Supabase RLS politikaları önerilir

## 📜 Lisans

MIT

## 🤖 AI Komut Şablonları

- Genel şablon: `AI_COMMAND_TEMPLATE.md`
- Eğitim örnek şablon (referans): `AI_Command_Template_v2.md`
- Hukuk odaklı şablon (önerilir): `AI_COMMAND_TEMPLATE_v3.md`

