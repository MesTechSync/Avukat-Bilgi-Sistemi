# Backend Integration Plan

Amaç: Petition/Contract kalıcı kayıt, dosya depolama ve PDF.

## Aşamalar

1) Supabase tabloları
   - petition_docs(id, title, content, owner, created_at)
   - contract_docs(id, title, content, owner, created_at)
   - RLS: owner = auth.uid(); anonim erişim yok
2) API entegrasyonu
   - create/update/list; optimistic UI ve hata geri alma
3) Dosya depolama
   - Supabase Storage: bucket “legal-docs”; sadece owner okuyabilir
4) PDF üretimi
   - İstemci tarafı (html2pdf) veya sunucu kenarı (edge fn)
5) Audit trail
   - minimal event log (create/update/export)

## Notlar

- KVKK: yalnızca içerik ve başlık; PII maskeleme yardımcıları kullanılsın.
