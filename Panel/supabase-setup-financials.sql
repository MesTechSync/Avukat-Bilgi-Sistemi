-- Supabase financials tablosu kontrolü ve düzeltme
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- 1. financials tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'financials' 
ORDER BY ordinal_position;

-- 2. Eğer tablo yoksa oluştur
CREATE TABLE IF NOT EXISTS financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. user_id foreign key constraint'ini kaldır (eğer varsa)
ALTER TABLE financials DROP CONSTRAINT IF EXISTS financials_user_id_fkey;

-- 4. user_id kolonunu nullable yap
ALTER TABLE financials ALTER COLUMN user_id DROP NOT NULL;

-- 5. RLS'yi devre dışı bırak
ALTER TABLE financials DISABLE ROW LEVEL SECURITY;

-- 6. Test verisi ekle (isteğe bağlı)
INSERT INTO financials (type, description, amount, date, category, status) VALUES
('income', 'Dava Ücreti - Ahmet Yılmaz', 5000.00, '2024-01-15', 'Gelir', 'completed'),
('income', 'Danışmanlık Ücreti', 2500.00, '2024-01-20', 'Gelir', 'completed'),
('expense', 'Ofis Kira', 3000.00, '2024-01-01', 'Gider', 'completed'),
('expense', 'Elektrik Faturası', 450.00, '2024-01-10', 'Gider', 'completed'),
('income', 'Sözleşme Hazırlama', 1500.00, '2024-01-25', 'Gelir', 'completed');

-- 7. Sonucu kontrol et
SELECT * FROM financials ORDER BY created_at DESC LIMIT 5;
