/*
  # Avukat Yönetim Sistemi Veritabanı Şeması

  1. Yeni Tablolar
    - `clients` - Müvekkil bilgileri
      - `id` (uuid, primary key)
      - `name` (text, müvekkil adı)
      - `email` (text, e-posta)
      - `phone` (text, telefon)
      - `company` (text, şirket)
      - `address` (text, adres)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `cases` - Dava bilgileri
      - `id` (uuid, primary key)
      - `title` (text, dava başlığı)
      - `client_id` (uuid, müvekkil referansı)
      - `case_type` (text, dava türü)
      - `status` (text, durum)
      - `deadline` (date, son tarih)
      - `priority` (text, öncelik)
      - `amount` (text, tutar)
      - `description` (text, açıklama)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointments` - Randevu bilgileri
      - `id` (uuid, primary key)
      - `title` (text, randevu başlığı)
      - `date` (date, tarih)
      - `time` (time, saat)
      - `type` (text, randevu türü)
      - `status` (text, durum)
      - `client_id` (uuid, müvekkil referansı)
      - `case_id` (uuid, dava referansı)
      - `description` (text, açıklama)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `documents` - Belge bilgileri
      - `id` (uuid, primary key)
      - `title` (text, belge başlığı)
      - `type` (text, belge türü)
      - `category` (text, kategori)
      - `file_path` (text, dosya yolu)
      - `case_id` (uuid, dava referansı)
      - `client_id` (uuid, müvekkil referansı)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `legal_research` - Hukuki araştırma bilgileri
      - `id` (uuid, primary key)
      - `title` (text, araştırma başlığı)
      - `source` (text, kaynak)
      - `category` (text, kategori)
      - `relevance` (text, ilgililik)
      - `content` (text, içerik)
      - `url` (text, bağlantı)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `financials` - Mali bilgiler
      - `id` (uuid, primary key)
      - `type` (text, gelir/gider)
      - `amount` (text, tutar)
      - `description` (text, açıklama)
      - `category` (text, kategori)
      - `date` (date, tarih)
      - `case_id` (uuid, dava referansı)
      - `client_id` (uuid, müvekkil referansı)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Güvenlik
    - Tüm tablolarda RLS etkin
    - Authenticated kullanıcılar için okuma/yazma politikaları
    - Admin kullanıcılar için tam erişim

  3. İlişkiler
    - Cases → Clients (foreign key)
    - Appointments → Clients, Cases (foreign key)
    - Documents → Clients, Cases (foreign key)
    - Financials → Clients, Cases (foreign key)
*/

-- Clients tablosu
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  company text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cases tablosu
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  case_type text NOT NULL,
  status text DEFAULT 'Beklemede',
  deadline date,
  priority text DEFAULT 'Orta',
  amount text DEFAULT '0',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments tablosu
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'Planlandı',
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents tablosu
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  file_path text NOT NULL,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Legal Research tablosu
CREATE TABLE IF NOT EXISTS legal_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text NOT NULL,
  category text NOT NULL,
  relevance text DEFAULT 'Orta',
  content text DEFAULT '',
  url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Financials tablosu
CREATE TABLE IF NOT EXISTS financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Etkinleştirme
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;

-- Güvenlik Politikaları
CREATE POLICY "Authenticated users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage cases"
  ON cases
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage legal research"
  ON legal_research
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage financials"
  ON financials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger fonksiyonu updated_at için
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'ları
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_research_updated_at BEFORE UPDATE ON legal_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financials_updated_at BEFORE UPDATE ON financials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();