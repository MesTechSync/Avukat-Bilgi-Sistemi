# API Strategy & Migration Plan

Amaç: Supabase ve mevcut/gelecek API’ler için profesyonel geçiş ve tasarım rehberi.

## İlkeler

- Sade ve açık sözleşmeler: /api/* yolları temiz, versiyonlu (v1)
- Yetkilendirme: JWT + RLS; istemcide minimum yetki, sunucuda doğrulama
- Gizlilik: KVKK gereği PII maskeleme ve amaç sınırlaması
- Observability: her çağrı için correlation-id; rate limit ve retry stratejileri

## Geçiş Stratejisi

1) Okuma ağırlıklı akışlar için Supabase client ile doğrudan erişim (RLS güvenli)
2) Yazma/yan etkili akışlar için Edge Function/Proxy katmanı (audit + yetki kontrolü)
3) Yavaş/uzun işlemler (PDF) için task queue veya async işleme

## Yol Haritası

- v1/auth: oturum, profil
- v1/docs: petition_docs ve contract_docs CRUD
- v1/storage: imzalı URL üretimi
- v1/voice: voice_history kayıtları (opt‑in)

## Taşıma Adımları

- [ ] Supabase şemaları ve RLS; migration dosyaları
- [ ] Edge Functions: createDoc, updateDoc, exportPdf
- [ ] İstemci SDK soyut katmanı: hooks/useDocsApi.ts
- [ ] Testler: sözleşme (contract) testleri ve e2e
