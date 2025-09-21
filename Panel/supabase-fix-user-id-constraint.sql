-- Supabase user_id foreign key constraint'ini düzeltme
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- 1. user_id foreign key constraint'ini kaldır
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_user_id_fkey;

-- 2. user_id kolonunu nullable yap
ALTER TABLE cases ALTER COLUMN user_id DROP NOT NULL;

-- 3. clients tablosu için de aynısını yap
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE clients ALTER COLUMN user_id DROP NOT NULL;

-- 4. Diğer tablolar için de kontrol et ve düzelt
DO $$
DECLARE
    constraint_name text;
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('appointments', 'documents', 'legal_research', 'financials', 'payments', 'tasks')
    LOOP
        BEGIN
            -- user_id foreign key constraint'ini kaldır
            SELECT conname INTO constraint_name
            FROM pg_constraint 
            WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = table_name)
            AND confrelid = (SELECT oid FROM pg_class WHERE relname = 'users');
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', table_name, constraint_name);
                RAISE NOTICE 'Dropped constraint % for table %', constraint_name, table_name;
            END IF;
            
            -- user_id kolonunu nullable yap
            EXECUTE format('ALTER TABLE %I ALTER COLUMN user_id DROP NOT NULL', table_name);
            RAISE NOTICE 'Made user_id nullable for table %', table_name;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not modify table %: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. Sonucu kontrol et
SELECT 
    table_name,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;
