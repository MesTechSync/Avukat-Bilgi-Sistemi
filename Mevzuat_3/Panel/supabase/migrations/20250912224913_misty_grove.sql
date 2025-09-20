/*
  # Örnek Veri Ekleme

  1. Örnek Müvekiller
  2. Örnek Davalar
  3. Örnek Randevular
  4. Örnek Belgeler
  5. Örnek Hukuki Araştırmalar
  6. Örnek Mali Kayıtlar
*/

-- Örnek müvekiller
INSERT INTO clients (name, email, phone, company, address) VALUES
('Mehmet Yılmaz', 'mehmet@email.com', '0532 123 4567', 'ABC Şirket', 'İstanbul, Türkiye'),
('Ayşe Demir', 'ayse@email.com', '0543 987 6543', 'XYZ Ltd', 'Ankara, Türkiye'),
('Ali Kaya', 'ali@email.com', '0554 456 7890', 'Bireysel', 'İzmir, Türkiye'),
('Fatma Özkan', 'fatma@email.com', '0565 321 9876', 'DEF Holding', 'Bursa, Türkiye'),
('Hasan Çelik', 'hasan@email.com', '0576 654 3210', 'GHI A.Ş.', 'Antalya, Türkiye');

-- Örnek davalar
INSERT INTO cases (title, client_id, case_type, status, deadline, priority, amount, description) VALUES
('Ticari Dava - Şirket A', (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz'), 'Ticari', 'Devam Ediyor', '2024-12-15', 'Yüksek', '150000', 'Sözleşme ihlali nedeniyle açılan ticari dava'),
('İş Mahkemesi - İşçi Hakları', (SELECT id FROM clients WHERE name = 'Ayşe Demir'), 'İş Hukuku', 'İnceleme', '2024-11-20', 'Orta', '75000', 'İşten çıkarma tazminatı davası'),
('Boşanma Davası', (SELECT id FROM clients WHERE name = 'Ali Kaya'), 'Aile Hukuku', 'Beklemede', '2025-01-10', 'Düşük', '25000', 'Anlaşmalı boşanma süreci'),
('Miras Davası - Emlak', (SELECT id FROM clients WHERE name = 'Fatma Özkan'), 'Miras Hukuku', 'Tamamlandı', '2024-09-30', 'Yüksek', '300000', 'Emlak mirası paylaşım davası'),
('Tazminat Davası', (SELECT id FROM clients WHERE name = 'Hasan Çelik'), 'Tazminat', 'Devam Ediyor', '2024-12-25', 'Orta', '100000', 'Maddi ve manevi tazminat talebi');

-- Örnek randevular
INSERT INTO appointments (title, date, time, type, status, client_id, description) VALUES
('Müvekkil Görüşmesi - Mehmet Yılmaz', '2024-10-15', '10:00', 'Görüşme', 'Planlandı', (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz'), 'Dava süreci hakkında bilgilendirme'),
('Mahkeme Duruşması - Ticari Dava', '2024-10-18', '14:00', 'Duruşma', 'Onaylandı', (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz'), 'İlk duruşma'),
('Uzman Görüşmesi - İş Hukuku', '2024-10-20', '09:30', 'Konsültasyon', 'Beklemede', (SELECT id FROM clients WHERE name = 'Ayşe Demir'), 'İş hukuku uzmanı ile görüşme'),
('Belge Teslimi - Ayşe Demir', '2024-10-22', '16:00', 'Belge', 'Planlandı', (SELECT id FROM clients WHERE name = 'Ayşe Demir'), 'Gerekli evrakların teslimi');

-- Örnek belgeler
INSERT INTO documents (title, type, category, file_path, case_id, client_id) VALUES
('Ticari Sözleşme', 'PDF', 'Sözleşme', '/documents/ticari-sozlesme.pdf', (SELECT id FROM cases WHERE title LIKE 'Ticari Dava%'), (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz')),
('İş Sözleşmesi', 'PDF', 'Sözleşme', '/documents/is-sozlesmesi.pdf', (SELECT id FROM cases WHERE title LIKE 'İş Mahkemesi%'), (SELECT id FROM clients WHERE name = 'Ayşe Demir')),
('Evlilik Cüzdanı', 'PDF', 'Kimlik', '/documents/evlilik-cuzdani.pdf', (SELECT id FROM cases WHERE title LIKE 'Boşanma%'), (SELECT id FROM clients WHERE name = 'Ali Kaya')),
('Tapu Senedi', 'PDF', 'Emlak', '/documents/tapu-senedi.pdf', (SELECT id FROM cases WHERE title LIKE 'Miras%'), (SELECT id FROM clients WHERE name = 'Fatma Özkan')),
('Trafik Raporu', 'PDF', 'Rapor', '/documents/trafik-raporu.pdf', (SELECT id FROM cases WHERE title LIKE 'Tazminat%'), (SELECT id FROM clients WHERE name = 'Hasan Çelik'));

-- Örnek hukuki araştırmalar
INSERT INTO legal_research (title, source, category, relevance, content, url) VALUES
('Ticari Dava Emsal Kararları', 'Kazancı Hukuk', 'Ticari Hukuk', 'Yüksek', 'Ticari sözleşme ihlali davalarında emsal kararlar ve içtihatlar', 'https://kazanci.com'),
('İş Kanunu 25. Madde Yorumu', 'Mevzuat.gov.tr', 'İş Hukuku', 'Orta', 'İş kanununun 25. maddesinin detaylı yorumu ve uygulaması', 'https://mevzuat.gov.tr'),
('Tazminat Hesaplama Yöntemleri', 'Yargıtay Kararları', 'Tazminat', 'Yüksek', 'Maddi ve manevi tazminat hesaplama yöntemleri ve güncel oranlar', 'https://yargitay.gov.tr'),
('Aile Hukuku Son Değişiklikler', 'Resmi Gazete', 'Aile Hukuku', 'Orta', '2024 yılında aile hukukunda yapılan değişiklikler ve etkileri', 'https://resmigazete.gov.tr');

-- Örnek mali kayıtlar
INSERT INTO financials (type, amount, description, category, date, case_id, client_id) VALUES
('income', '50000', 'Ticari Dava Avukatlık Ücreti', 'Avukatlık Ücreti', '2024-10-01', (SELECT id FROM cases WHERE title LIKE 'Ticari Dava%'), (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz')),
('income', '25000', 'İş Mahkemesi Danışmanlık', 'Danışmanlık', '2024-10-05', (SELECT id FROM cases WHERE title LIKE 'İş Mahkemesi%'), (SELECT id FROM clients WHERE name = 'Ayşe Demir')),
('income', '15000', 'Boşanma Davası Ücreti', 'Avukatlık Ücreti', '2024-10-08', (SELECT id FROM cases WHERE title LIKE 'Boşanma%'), (SELECT id FROM clients WHERE name = 'Ali Kaya')),
('expense', '5000', 'Mahkeme Harçları', 'Mahkeme Giderleri', '2024-10-10', (SELECT id FROM cases WHERE title LIKE 'Ticari Dava%'), (SELECT id FROM clients WHERE name = 'Mehmet Yılmaz')),
('expense', '2000', 'Bilirkişi Ücreti', 'Uzman Giderleri', '2024-10-12', (SELECT id FROM cases WHERE title LIKE 'Tazminat%'), (SELECT id FROM clients WHERE name = 'Hasan Çelik'));