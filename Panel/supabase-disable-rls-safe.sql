-- Supabase RLS politikalarını devre dışı bırakma (sadece mevcut tablolar)
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- 1. Cases tablosu için RLS'yi devre dışı bırak
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;

-- 2. Clients tablosu için RLS'yi devre dışı bırak
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 3. Mevcut tabloları kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 4. Sadece mevcut tablolar için RLS'yi devre dışı bırak
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'RLS disabled for table: %', table_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not disable RLS for table %: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;
