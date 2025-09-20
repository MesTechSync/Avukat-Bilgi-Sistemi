-- Avukat Bilgi Sistemi - Supabase Şeması (Panel uyumlu)
-- Odak: cases, clients, appointments, documents, financials, legal_research
-- Tasarım hedefleri:
--  - ID olarak BIGSERIAL (JS number ile uyumlu)
--  - created_at/updated_at otomatik
--  - user_id otomatik olarak auth.uid() ile doldurulur (kod değişikliğine gerek yok)
--  - Basit ve esnek CHECK/enum kullanımı (Türkçe statü/öncelik değerlerine izin verir)

-- Gerekli uzantılar (Supabase projelerinde hazırdır)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Yardımcı fonksiyonlar -----------------------------------------------------

-- updated_at sütununu otomatik güncelle
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_id sütununu oturum kullanıcısı ile otomatik doldur
CREATE OR REPLACE FUNCTION set_user_id_to_auth_uid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Basit doğrulamalar (opsiyonel)
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Tablolar -------------------------------------------------------------------

-- Müvekkiller
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT CHECK (validate_email(email)),
  phone TEXT,
  company TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Davalar
CREATE TABLE IF NOT EXISTS cases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  case_type TEXT,
  status TEXT,           -- örn: 'Devam Ediyor', 'Beklemede', 'İnceleme', 'Kapandı'
  deadline DATE,
  priority TEXT,         -- örn: 'Düşük', 'Normal', 'Yüksek', 'Acil'
  amount NUMERIC(15,2),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Randevular
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT,             -- örn: 'Görüşme', 'Duruşma', 'Danışmanlık', ...
  status TEXT,           -- örn: 'Planlandı', 'Onaylandı', 'Beklemede', 'Tamamlandı', 'İptal Edildi'
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
  description TEXT,
  -- Panel bileşeninde kullanılan ek alanlar
  notes TEXT,
  location TEXT,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  priority TEXT,         -- 'Düşük', 'Normal', 'Yüksek', 'Acil'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Belgeler
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  category TEXT,
  file_path TEXT,
  case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mali İşler
CREATE TABLE IF NOT EXISTS financials (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC(15,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hukuki Araştırma
CREATE TABLE IF NOT EXISTS legal_research (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT,
  category TEXT,
  relevance TEXT,
  content TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tetikleyiciler -------------------------------------------------------------

-- updated_at güncelle
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cases_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_financials_updated_at
BEFORE UPDATE ON financials
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_legal_research_updated_at
BEFORE UPDATE ON legal_research
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- user_id ototamamlama (INSERT)
CREATE TRIGGER trg_clients_set_user_id
BEFORE INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

CREATE TRIGGER trg_cases_set_user_id
BEFORE INSERT ON cases
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

CREATE TRIGGER trg_appointments_set_user_id
BEFORE INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

CREATE TRIGGER trg_documents_set_user_id
BEFORE INSERT ON documents
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

CREATE TRIGGER trg_financials_set_user_id
BEFORE INSERT ON financials
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

CREATE TRIGGER trg_legal_research_set_user_id
BEFORE INSERT ON legal_research
FOR EACH ROW EXECUTE FUNCTION set_user_id_to_auth_uid();

-- RLS (satır seviyesinde güvenlik) ------------------------------------------

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_research ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi kayıtlarını okuyup/yazabilsin
CREATE POLICY clients_rls ON clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY cases_rls ON cases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY appointments_rls ON appointments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY documents_rls ON documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY financials_rls ON financials
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY legal_research_rls ON legal_research
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- İndeksler ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_financials_user_id ON financials(user_id);
CREATE INDEX IF NOT EXISTS idx_financials_date ON financials(date);
CREATE INDEX IF NOT EXISTS idx_financials_case_id ON financials(case_id);
CREATE INDEX IF NOT EXISTS idx_financials_client_id ON financials(client_id);
CREATE INDEX IF NOT EXISTS idx_legal_research_user_id ON legal_research(user_id);

-- Notlar ---------------------------------------------------------------------
-- 1) Bu şema Panel'deki TypeScript arayüzleri ile birebir alan adı uyumundadır.
-- 2) RLS etkin olduğu için, istemci tarafında oturum (Auth) gereklidir.
--    INSERT sırasında user_id otomatik atanır. Kodda user_id göndermeniz gerekmez.
-- 3) appointments.time kolonunu TIME olarak tuttuk; Supabase JS 'HH:MM:SS' string döndürür.
--    Arzu edilirse TEXT'e çevrilebilir.
