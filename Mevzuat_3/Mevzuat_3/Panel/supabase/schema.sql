-- Mevzuat_3 Supabase Veritabanı Şeması
-- KVKK uyumlu veri yapısı ve RLS politikaları

-- Kullanıcı Profilleri Tablosu
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'lawyer')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  privacy_consents TEXT[] DEFAULT '{}',
  phone TEXT,
  company TEXT,
  bio TEXT
);

-- KVKK Rızalar Tablosu
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('voice_recording', 'data_processing', 'analytics', 'marketing')),
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  purpose TEXT NOT NULL,
  data_categories TEXT[] NOT NULL DEFAULT '{}',
  retention_period INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ses Geçmişi Tablosu (KVKK uyumlu)
CREATE TABLE IF NOT EXISTS voice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  command TEXT,
  confidence REAL,
  language TEXT DEFAULT 'tr-TR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- KVKK için otomatik silme
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Dilekçe Belgeleri Tablosu
CREATE TABLE IF NOT EXISTS petition_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'final', 'archived')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- KVKK için otomatik silme
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days')
);

-- Sözleşme Belgeleri Tablosu
CREATE TABLE IF NOT EXISTS contract_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  contract_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'final', 'archived')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- KVKK için otomatik silme
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days')
);

-- Dava Yönetimi Tablosu
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  case_number TEXT,
  client_name TEXT,
  case_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  amount DECIMAL(15,2),
  description TEXT,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müvekkil Yönetimi Tablosu
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Randevu Yönetimi Tablosu
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mali İşler Tablosu
CREATE TABLE IF NOT EXISTS financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hukuki Araştırma Tablosu
CREATE TABLE IF NOT EXISTS legal_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT,
  category TEXT,
  relevance TEXT,
  content TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sistem Ayarları Tablosu
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS (Row Level Security) Politikaları

-- Kullanıcı Profilleri RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- KVKK Rızalar RLS
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own consents" ON privacy_consents
  FOR ALL USING (auth.uid() = user_id);

-- Ses Geçmişi RLS
ALTER TABLE voice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own voice history" ON voice_history
  FOR ALL USING (auth.uid() = user_id);

-- Dilekçe Belgeleri RLS
ALTER TABLE petition_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own petitions" ON petition_docs
  FOR ALL USING (auth.uid() = user_id);

-- Sözleşme Belgeleri RLS
ALTER TABLE contract_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own contracts" ON contract_docs
  FOR ALL USING (auth.uid() = user_id);

-- Dava Yönetimi RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cases" ON cases
  FOR ALL USING (auth.uid() = user_id);

-- Müvekkil Yönetimi RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Randevu Yönetimi RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id);

-- Mali İşler RLS
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own financials" ON financials
  FOR ALL USING (auth.uid() = user_id);

-- Hukuki Araştırma RLS
ALTER TABLE legal_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own research" ON legal_research
  FOR ALL USING (auth.uid() = user_id);

-- Sistem Ayarları RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Fonksiyonlar ve Tetikleyiciler

-- Otomatik updated_at güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at tetikleyicileri
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_consents_updated_at BEFORE UPDATE ON privacy_consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petition_docs_updated_at BEFORE UPDATE ON petition_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_docs_updated_at BEFORE UPDATE ON contract_docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financials_updated_at BEFORE UPDATE ON financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_research_updated_at BEFORE UPDATE ON legal_research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- KVKK uyumlu otomatik veri silme fonksiyonu
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Süresi dolmuş ses geçmişini sil
  DELETE FROM voice_history WHERE expires_at < NOW();
  
  -- Süresi dolmuş dilekçe belgelerini arşivle
  UPDATE petition_docs 
  SET status = 'archived' 
  WHERE expires_at < NOW() AND status != 'archived';
  
  -- Süresi dolmuş sözleşme belgelerini arşivle
  UPDATE contract_docs 
  SET status = 'archived' 
  WHERE expires_at < NOW() AND status != 'archived';
  
  RAISE NOTICE 'KVKK uyumlu veri temizleme tamamlandı: %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Günlük veri temizleme için cron job (Supabase'de pg_cron extension gerekli)
-- SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_voice_history_user_id ON voice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_history_created_at ON voice_history(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_history_expires_at ON voice_history(expires_at);

CREATE INDEX IF NOT EXISTS idx_petition_docs_user_id ON petition_docs(user_id);
CREATE INDEX IF NOT EXISTS idx_petition_docs_status ON petition_docs(status);
CREATE INDEX IF NOT EXISTS idx_petition_docs_expires_at ON petition_docs(expires_at);

CREATE INDEX IF NOT EXISTS idx_contract_docs_user_id ON contract_docs(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_docs_status ON contract_docs(status);
CREATE INDEX IF NOT EXISTS idx_contract_docs_expires_at ON contract_docs(expires_at);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON cases(deadline);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_financials_user_id ON financials(user_id);
CREATE INDEX IF NOT EXISTS idx_financials_date ON financials(date);
CREATE INDEX IF NOT EXISTS idx_legal_research_user_id ON legal_research(user_id);

-- Veri doğrulama fonksiyonları
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN phone ~ '^\+?[1-9]\d{1,14}$';
END;
$$ LANGUAGE plpgsql;

-- E-posta doğrulama kısıtı
ALTER TABLE user_profiles ADD CONSTRAINT check_email_format 
  CHECK (validate_email(email));

-- Telefon doğrulama kısıtı
ALTER TABLE clients ADD CONSTRAINT check_phone_format 
  CHECK (phone IS NULL OR validate_phone(phone));

-- Başlangıç verileri (Admin kullanıcı)
INSERT INTO user_profiles (id, email, name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@mevzuat3.com',
  'Sistem Yöneticisi',
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;

-- Sistem ayarları
INSERT INTO user_settings (user_id, settings)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '{
    "voice": {
      "enabled": true,
      "language": "tr-TR",
      "confidence_threshold": 0.7
    },
    "privacy": {
      "data_retention_days": 30,
      "auto_delete_enabled": true,
      "consent_required": true
    },
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }'::jsonb
) ON CONFLICT (user_id) DO NOTHING;

