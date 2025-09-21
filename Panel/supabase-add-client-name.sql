-- Supabase veritabanında client_name kolonu ekleme
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- 1. client_name kolonunu cases tablosuna ekle
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_name TEXT;

-- 2. Mevcut kayıtları güncelle (varsayılan değer)
UPDATE cases 
SET client_name = 'Bilinmeyen Müvekkil' 
WHERE client_name IS NULL OR client_name = '';

-- 3. Kolon için açıklama ekle
COMMENT ON COLUMN cases.client_name IS 'Müvekkil adı';

-- 4. Tabloyu kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cases' 
ORDER BY ordinal_position;
