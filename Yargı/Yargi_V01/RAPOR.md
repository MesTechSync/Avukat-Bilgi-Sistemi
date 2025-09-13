# Yargı MCP – Teknik Rapor ve Kullanım Kılavuzu

Bu rapor, yargi-mcp yazılımının amacı, kapsamı, mimarisi, kurulum/çalıştırma adımları, yapılandırma seçenekleri, sık karşılaşılan sorunlar ve çözümleri ile üretim önerilerini kapsamlı şekilde açıklar.

## 1) Bu yazılım ne işe yarar?
Yargı MCP, Türkiye’deki çeşitli hukuk kurumlarının karar veritabanlarına erişimi kolaylaştıran bir MCP (Model Context Protocol) sunucusudur. LLM tabanlı istemciler (Claude Desktop, 5ire, Gemini CLI vb.) veya web/ASGI üzerinden HTTP ile:
- Karar arama (anahtar kelime, daire/kurul, tarih aralığı, kesin cümle arama vb.)
- Karar metinlerini Markdown’a dönüştürme (HTML/PDF → Markdown, sayfalandırma ile)
- Birden fazla kurum/veritabanı için birleşik (unified) API araçları
sağlar.

Desteklenen kaynaklar (özet):
- Yargıtay, Danıştay, Yerel/İstinaf Mahkemeleri, Kanun Yararına Bozma (KYB) – Bedesten API birleşik arama
- Emsal (UYAP), Uyuşmazlık Mahkemesi
- Anayasa Mahkemesi (Norm Denetimi + Bireysel Başvuru) – birleşik arama/getirme
- Kamu İhale Kurulu (KİK), Rekabet Kurumu
- Sayıştay (Genel Kurul, Temyiz Kurulu, Daire)
- KVKK (Brave Search aracılığıyla site hedeflemeli arama), BDDK

Token verimliliği için optimize edilmiştir; uzun kararlar sayfalanır, açıklamalar kısaltılmıştır.

## 2) Mimarî ve önemli bağımlılıklar
- Çatı: FastMCP (MCP server) + FastAPI/Starlette (ASGI web servisi)
- HTTP istemcileri: httpx, aiohttp
- İçerik işleme: markitdown[pdf], pypdf
- Tarayıcı otomasyonu (bazı veri kaynakları için): Playwright
- Doğrulama/şema: pydantic
- Kimlik & SaaS (opsiyonel): Clerk (clerk-backend-api), Stripe, Upstash Redis

Ana giriş noktaları:
- MCP CLI komutu: `yargi-mcp` (pyproject [project.scripts])
- ASGI uygulaması: `asgi_app:app` (uvicorn ile web servisi)

## 3) Sistem gereksinimleri
- Python 3.11+ (Windows 10/11, macOS, Linux). Windows’ta VC++ Redistributable önerilir.
- Git, internet bağlantısı
- Bazı modüller için ek disk ve indirme (Playwright, onnxruntime, magika vb.)

Bu oturumda Windows’ta Python 3.13 ile çalıştırma başarıyla test edilmiştir.

## 4) Kurulum (Geliştirme ortamı – Windows PowerShell)
1. Kaynak kod:
   ```powershell
   git clone https://github.com/saidsurucu/yargi-mcp
   cd yargi-mcp
   ```
2. (Önerilir) Python 3.11 sanal ortam:
   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   Not: Bu oturumda 3.13 global interpreter ile de çalışmıştır.
3. Bağımlılıklar (ASGI ile):
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install -e .[asgi]
   ```
4. Opsiyonel SaaS bağımlılıkları (Stripe, Clerk, Upstash):
   ```powershell
   python -m pip install stripe clerk-backend-api upstash-redis
   ```
5. (Opsiyonel) Playwright tarayıcıları:
   ```powershell
   python -m playwright install
   ```

## 5) Çalıştırma (ASGI web servisi)
Geliştirme modunda kimlik doğrulamasını kapatarak başlatma:
```powershell
$env:ENABLE_AUTH="false"
$env:PORT="8000"
$env:ALLOWED_ORIGINS="*"
uvicorn asgi_app:app --host 0.0.0.0 --port 8000
```
Doğrulama:
- http://localhost:8000/health
- http://localhost:8000/ → servis bilgisi
- http://localhost:8000/mcp → MCP HTTP endpoint kökü

Önemli not: `ENABLE_AUTH=false` iken uygulama geliştirme için RSA token üretir ve loglarda gösterir; üretimde auth’ı açınız.

## 6) MCP istemcileri ile kullanım
- 5ire (önerilen basit kurulum): Tools → +Local → Command: `uvx yargi-mcp`
- Claude Desktop: Developer config’e `mcpServers` altında `command: "uvx", args: ["yargi-mcp"]`
- Gemini CLI: settings.json’a `mcpServers` bloğu ile `uvx yargi-mcp`
Detay adımlar için repodaki `README.md` görseller ve örneklerle birlikte kapsamlı anlatım sunar.

## 7) Docker ile çalışma
- Geliştirme/test için Dockerfile ve docker-compose yer alır.
- Temel komutlar (opsiyonel):
  ```powershell
  docker build -t yargi-mcp:latest .
  docker compose up
  ```
- nginx reverser proxy profili, ssl mount’ları ve healthcheck tanımlıdır.

## 8) Yapılandırma (ENV değişkenleri)
`.env.example` dosyası referanstır. Başlıcaları:
- Genel: `HOST`, `PORT`, `LOG_LEVEL`, `ALLOWED_ORIGINS`, `BASE_URL`
- Kimlik: `ENABLE_AUTH` (true/false), `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_ISSUER`, `CLERK_DOMAIN`
- Stripe: `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
- JWT: `JWT_SECRET_KEY`

Geliştirme için hızlı başlangıç: `ENABLE_AUTH=false`.
Üretimde: `ENABLE_AUTH=true` + Clerk/Stripe anahtarlarını doldurunuz.

## 9) Sağlanan araçlar (özet)
- Bedesten birleşik arama: `search_bedesten_unified`, belge getirme: `get_bedesten_document_markdown`
- Emsal (UYAP): `search_emsal_detailed_decisions`, `get_emsal_document_markdown`
- Uyuşmazlık: `search_uyusmazlik_decisions`, `get_uyusmazlik_document_markdown_from_url`
- AYM birleşik: `search_anayasa_unified`, `get_anayasa_document_unified`
- KİK: `search_kik_decisions`, `get_kik_document_markdown`
- Rekabet Kurumu: `search_rekabet_kurumu_decisions`, `get_rekabet_kurumu_document`
- Sayıştay: üç tür arama + üç tür belge getirme
- KVKK: Brave Search ile arama + sayfalanmış belge getirme
- BDDK: optimize arama + sayfalanmış belge getirme

Tam liste ve parametre ayrıntıları için `README.md`.

## 10) Bu oturumda tespit edilen eksikler ve çözümler
- Hata: `ModuleNotFoundError: No module named 'stripe'`
  - Çözüm: `python -m pip install stripe`
- Hata: `ModuleNotFoundError: No module named 'clerk_backend_api'`
  - Çözüm: `python -m pip install clerk-backend-api`
- Opsiyonel: `upstash-redis` gereksinimi
  - Çözüm: `python -m pip install upstash-redis`
- Venv yok/yanlış Python: Windows’ta `py -3.11 -m venv .venv` başarısız olabilir; global Python 3.13 ile kurulum başarılı oldu. Öneri: 3.11 kurarak `.venv` kullanın veya 3.13 ile devam edin.
- Pydantic uyarısı: V2’ye geçişe dair `ConfigDict` uyarıları – işlevselliği engellemez; üretimde sürüm hizalaması planlayın.

Bu düzeltmeler sonrası sunucu başarıyla: `http://0.0.0.0:8000` üzerinde çalıştı, health endpoint kontrol edildi.

## 11) Sık karşılaşılan sorunlar
- Playwright gereksinimleri: Bazı yollar için `python -m playwright install` gerekir.
- PowerShell script çalıştırma: `Activate.ps1` için ExecutionPolicy kısıtları olabilir; yönetici olarak gerekli izinleri sağlayın veya global Python’la çalışın.
- CORS: Üretimde `ALLOWED_ORIGINS` değerini daraltın.
- OAuth/Clerk: Üretimde `.env` içindeki `CLERK_*` anahtarlarını zorunlu doldurun, `ENABLE_AUTH=true` yapın.

## 12) Üretim önerileri
- Docker + reverse proxy (nginx) ile dağıtım
- Sağlık ve metrik izleme (health endpoint, konteyner healthcheck aktif)
- Gizli anahtar yönetimi (Key Vault/Secrets Manager)
- Loglama ve hata izleme (JSON log formatı, ayrı log volume)
- Rate limit, caching (ileride Redis profiliyle)

## 13) Hızlı referans komutları (Windows PowerShell)
- Kurulum (ASGI):
  ```powershell
  python -m pip install -e .[asgi]
  python -m pip install stripe clerk-backend-api upstash-redis
  ```
- Çalıştırma (dev):
  ```powershell
  $env:ENABLE_AUTH="false"; $env:PORT="8000"; $env:ALLOWED_ORIGINS="*"; uvicorn asgi_app:app --host 0.0.0.0 --port 8000
  ```
- Sağlık kontrolü:
  ```powershell
  Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing
  ```

  ## Ekran Görüntüleri

  Yerel çalıştırmadan alınan örnek görüntüler:

  - Anasayfa: screenshots/root.png
  - Sağlık kontrolü: screenshots/health.png
  - MCP kök: screenshots/mcp.png

---
Bu rapor, projeyi hızlıca anlama, kurma ve çalıştırma; ayrıca tipik kurulum hatalarını hızla giderme amacıyla hazırlanmıştır. Daha fazla ayrıntı için projenin `README.md` dosyasına ve `docs/` klasörüne bakınız.
