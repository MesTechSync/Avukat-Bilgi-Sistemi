-- Supabase RLS politikalarını devre dışı bırakma
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- 1. Cases tablosu için RLS'yi devre dışı bırak
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;

-- 2. Clients tablosu için RLS'yi devre dışı bırak
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 3. Diğer tablolar için de RLS'yi devre dışı bırak
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_research DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial DISABLE ROW LEVEL SECURITY;

-- 4. RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cases', 'clients', 'appointments', 'documents', 'legal_research', 'financial');
