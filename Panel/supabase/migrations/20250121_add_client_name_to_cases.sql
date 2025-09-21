-- Add client_name column to cases table if it doesn't exist
ALTER TABLE cases ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Update existing cases to have client_name if they don't have it
UPDATE cases 
SET client_name = 'Bilinmeyen Müvekkil' 
WHERE client_name IS NULL OR client_name = '';

-- Add comment to the column
COMMENT ON COLUMN cases.client_name IS 'Müvekkil adı - cases tablosunda müvekkil bilgisi için';
