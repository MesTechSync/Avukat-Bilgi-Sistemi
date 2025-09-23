export interface ContractTemplate {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  content: string;
  requiredFields: string[];
  legalBasis: string[];
  contractType: string;
  estimatedTime: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  lastUpdated: string;
  usageCount: number;
  rating: number;
}

export const contractCategories = {
  'İş Hukuku': {
    'İş Sözleşmesi': ['belirsiz-sureli-is-sozlesmesi', 'belirli-sureli-is-sozlesmesi', 'part-time-is-sozlesmesi', 'uzaktan-calisma-sozlesmesi'],
    'İşçi Hakları': ['isci-haklari-sozlesmesi', 'sendika-sozlesmesi', 'toplu-is-sozlesmesi', 'isci-temsilcisi-sozlesmesi'],
    'İş Güvenliği': ['is-guvenligi-sozlesmesi', 'is-kazasi-sozlesmesi', 'meslek-hastaligi-sozlesmesi', 'is-yeri-kapatma-sozlesmesi']
  },
  'Ticaret Hukuku': {
    'Şirket': ['anonim-sirket-sozlesmesi', 'limited-sirket-sozlesmesi', 'kollektif-sirket-sozlesmesi', 'komandit-sirket-sozlesmesi'],
    'Ticari İşlem': ['ticari-islem-sozlesmesi', 'ticari-sozlesme', 'ticari-ortaklik-sozlesmesi', 'ticari-vekalet-sozlesmesi'],
    'Rekabet': ['rekabet-sozlesmesi', 'haksiz-rekabet-sozlesmesi', 'rekabet-yasagi-sozlesmesi', 'rekabet-düzeltme-sozlesmesi']
  },
  'Borçlar Hukuku': {
    'Satış': ['satis-sozlesmesi', 'kira-sozlesmesi', 'hizmet-sozlesmesi', 'eser-sozlesmesi'],
    'Kira': ['kira-sozlesmesi', 'kira-artirimi-sozlesmesi', 'kira-feshi-sozlesmesi', 'kira-yenileme-sozlesmesi'],
    'Hizmet': ['hizmet-sozlesmesi', 'danismanlik-sozlesmesi', 'bakim-sozlesmesi', 'temizlik-sozlesmesi']
  },
  'Gayrimenkul': {
    'Kira': ['konut-kira-sozlesmesi', 'ticari-kira-sozlesmesi', 'arsa-kira-sozlesmesi', 'depo-kira-sozlesmesi'],
    'Satış': ['konut-satis-sozlesmesi', 'arsa-satis-sozlesmesi', 'ticari-gayrimenkul-satis-sozlesmesi', 'kat-mulkiyeti-satis-sozlesmesi'],
    'Ortaklık': ['ortaklik-sozlesmesi', 'kat-mulkiyeti-sozlesmesi', 'kat-irtifaki-sozlesmesi', 'arsa-payi-sozlesmesi']
  },
  'Teknoloji': {
    'Yazılım': ['yazilim-gelistirme-sozlesmesi', 'yazilim-lisans-sozlesmesi', 'yazilim-bakim-sozlesmesi', 'yazilim-destek-sozlesmesi'],
    'IT Hizmetleri': ['it-hizmetleri-sozlesmesi', 'sunucu-kiralama-sozlesmesi', 'domain-sozlesmesi', 'hosting-sozlesmesi'],
    'Dijital': ['dijital-pazarlama-sozlesmesi', 'sosyal-medya-sozlesmesi', 'web-tasarim-sozlesmesi', 'seo-sozlesmesi']
  },
  'Sağlık': {
    'Sağlık Hizmetleri': ['saglik-hizmetleri-sozlesmesi', 'hastane-sozlesmesi', 'doktor-sozlesmesi', 'hemşire-sozlesmesi'],
    'Tıbbi Cihaz': ['tip-cihaz-sozlesmesi', 'tip-cihaz-bakim-sozlesmesi', 'tip-cihaz-satis-sozlesmesi', 'tip-cihaz-kiralama-sozlesmesi'],
    'İlaç': ['ilac-sozlesmesi', 'ilac-dagitim-sozlesmesi', 'ilac-uretim-sozlesmesi', 'ilac-arastirma-sozlesmesi']
  },
  'Eğitim': {
    'Eğitim Hizmetleri': ['egitim-hizmetleri-sozlesmesi', 'kurs-sozlesmesi', 'ozel-ders-sozlesmesi', 'dil-kursu-sozlesmesi'],
    'Okul': ['okul-sozlesmesi', 'universite-sozlesmesi', 'anaokulu-sozlesmesi', 'ozel-okul-sozlesmesi'],
    'Öğretmen': ['ogretmen-sozlesmesi', 'egitmen-sozlesmesi', 'mentor-sozlesmesi', 'koç-sozlesmesi']
  },
  'Finans': {
    'Kredi': ['kredi-sozlesmesi', 'konut-kredisi-sozlesmesi', 'tasit-kredisi-sozlesmesi', 'ticari-kredi-sozlesmesi'],
    'Yatırım': ['yatirim-sozlesmesi', 'portfoy-sozlesmesi', 'fon-sozlesmesi', 'borsa-sozlesmesi'],
    'Sigorta': ['sigorta-sozlesmesi', 'hayat-sigortasi-sozlesmesi', 'kasko-sozlesmesi', 'dask-sozlesmesi']
  }
};

export const contractTemplates: ContractTemplate[] = [
  // İŞ HUKUKU - İŞ SÖZLEŞMESİ
  {
    id: 'belirsiz-sureli-is-sozlesmesi',
    title: 'Belirsiz Süreli İş Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'Belirsiz süreli iş sözleşmesi şablonu',
    keywords: ['iş', 'sözleşme', 'belirsiz', 'süreli', 'çalışan'],
    content: `İŞ SÖZLEŞMESİ

İŞVEREN: [İşveren Ad Soyad/Şirket Adı]
Adres: [İşveren Adresi]
T.C. Kimlik No: [İşveren T.C. No]
Vergi No: [İşveren Vergi No]

İŞÇİ: [İşçi Ad Soyad]
Adres: [İşçi Adresi]
T.C. Kimlik No: [İşçi T.C. No]

KONU: Belirsiz süreli iş sözleşmesi

MADDELER:

1. İŞ TANIMI
İşçi, [Pozisyon] pozisyonunda çalışacaktır.

2. İŞ YERİ
İşçi, [İş Yeri Adresi] adresindeki iş yerinde çalışacaktır.

3. ÇALIŞMA SÜRESİ
İşçi, haftada [Haftalık Çalışma Saati] saat çalışacaktır.

4. MAAŞ
İşçiye aylık [Maaş Miktarı] TL maaş ödenecektir.

5. İŞE BAŞLAMA TARİHİ
İşçi, [İşe Başlama Tarihi] tarihinde işe başlayacaktır.

6. DENEME SÜRESİ
İşçi, [Deneme Süresi] ay deneme süresine tabidir.

7. İŞÇİ HAKLARI
İşçi, İş Kanunu'nda belirtilen tüm haklara sahiptir.

8. FESİH
Bu sözleşme, İş Kanunu hükümlerine göre feshedilebilir.

9. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, İş Mahkemesi'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

İŞVEREN                    İŞÇİ
[İmza]                    [İmza]`,
    requiredFields: ['İşveren Ad Soyad/Şirket Adı', 'İşveren Adresi', 'İşçi Ad Soyad', 'İşçi Adresi', 'Pozisyon', 'Maaş Miktarı', 'İşe Başlama Tarihi'],
    legalBasis: ['İş Kanunu 8', 'İş Kanunu 17', 'İş Kanunu 25'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.8
  },
  {
    id: 'belirli-sureli-is-sozlesmesi',
    title: 'Belirli Süreli İş Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'Belirli süreli iş sözleşmesi şablonu',
    keywords: ['iş', 'sözleşme', 'belirli', 'süreli', 'çalışan'],
    content: `İŞ SÖZLEŞMESİ

İŞVEREN: [İşveren Ad Soyad/Şirket Adı]
Adres: [İşveren Adresi]
T.C. Kimlik No: [İşveren T.C. No]
Vergi No: [İşveren Vergi No]

İŞÇİ: [İşçi Ad Soyad]
Adres: [İşçi Adresi]
T.C. Kimlik No: [İşçi T.C. No]

KONU: Belirli süreli iş sözleşmesi

MADDELER:

1. İŞ TANIMI
İşçi, [Pozisyon] pozisyonunda çalışacaktır.

2. İŞ YERİ
İşçi, [İş Yeri Adresi] adresindeki iş yerinde çalışacaktır.

3. ÇALIŞMA SÜRESİ
İşçi, haftada [Haftalık Çalışma Saati] saat çalışacaktır.

4. MAAŞ
İşçiye aylık [Maaş Miktarı] TL maaş ödenecektir.

5. İŞE BAŞLAMA TARİHİ
İşçi, [İşe Başlama Tarihi] tarihinde işe başlayacaktır.

6. SÖZLEŞME SÜRESİ
Bu sözleşme [Sözleşme Süresi] süreyle yapılmıştır.

7. SÖZLEŞME BİTİŞ TARİHİ
Sözleşme [Sözleşme Bitiş Tarihi] tarihinde sona erecektir.

8. İŞÇİ HAKLARI
İşçi, İş Kanunu'nda belirtilen tüm haklara sahiptir.

9. FESİH
Bu sözleşme, İş Kanunu hükümlerine göre feshedilebilir.

10. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, İş Mahkemesi'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

İŞVEREN                    İŞÇİ
[İmza]                    [İmza]`,
    requiredFields: ['İşveren Ad Soyad/Şirket Adı', 'İşveren Adresi', 'İşçi Ad Soyad', 'İşçi Adresi', 'Pozisyon', 'Maaş Miktarı', 'İşe Başlama Tarihi', 'Sözleşme Süresi', 'Sözleşme Bitiş Tarihi'],
    legalBasis: ['İş Kanunu 8', 'İş Kanunu 17', 'İş Kanunu 25'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.7
  },
  {
    id: 'part-time-is-sozlesmesi',
    title: 'Part-Time İş Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'Yarı zamanlı iş sözleşmesi şablonu',
    keywords: ['iş', 'sözleşme', 'part-time', 'yarı zamanlı', 'çalışan'],
    content: `İŞ SÖZLEŞMESİ

İŞVEREN: [İşveren Ad Soyad/Şirket Adı]
Adres: [İşveren Adresi]
T.C. Kimlik No: [İşveren T.C. No]
Vergi No: [İşveren Vergi No]

İŞÇİ: [İşçi Ad Soyad]
Adres: [İşçi Adresi]
T.C. Kimlik No: [İşçi T.C. No]

KONU: Part-time iş sözleşmesi

MADDELER:

1. İŞ TANIMI
İşçi, [Pozisyon] pozisyonunda yarı zamanlı çalışacaktır.

2. İŞ YERİ
İşçi, [İş Yeri Adresi] adresindeki iş yerinde çalışacaktır.

3. ÇALIŞMA SÜRESİ
İşçi, haftada [Haftalık Çalışma Saati] saat çalışacaktır.

4. MAAŞ
İşçiye aylık [Maaş Miktarı] TL maaş ödenecektir.

5. İŞE BAŞLAMA TARİHİ
İşçi, [İşe Başlama Tarihi] tarihinde işe başlayacaktır.

6. ÇALIŞMA GÜNLERİ
İşçi, [Çalışma Günleri] günlerinde çalışacaktır.

7. ÇALIŞMA SAATLERİ
İşçi, [Çalışma Saatleri] saatlerinde çalışacaktır.

8. İŞÇİ HAKLARI
İşçi, İş Kanunu'nda belirtilen tüm haklara sahiptir.

9. FESİH
Bu sözleşme, İş Kanunu hükümlerine göre feshedilebilir.

10. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, İş Mahkemesi'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

İŞVEREN                    İŞÇİ
[İmza]                    [İmza]`,
    requiredFields: ['İşveren Ad Soyad/Şirket Adı', 'İşveren Adresi', 'İşçi Ad Soyad', 'İşçi Adresi', 'Pozisyon', 'Maaş Miktarı', 'İşe Başlama Tarihi', 'Haftalık Çalışma Saati', 'Çalışma Günleri', 'Çalışma Saatleri'],
    legalBasis: ['İş Kanunu 8', 'İş Kanunu 17', 'İş Kanunu 25'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },
  {
    id: 'uzaktan-calisma-sozlesmesi',
    title: 'Uzaktan Çalışma Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'Uzaktan çalışma sözleşmesi şablonu',
    keywords: ['iş', 'sözleşme', 'uzaktan', 'çalışma', 'remote'],
    content: `İŞ SÖZLEŞMESİ

İŞVEREN: [İşveren Ad Soyad/Şirket Adı]
Adres: [İşveren Adresi]
T.C. Kimlik No: [İşveren T.C. No]
Vergi No: [İşveren Vergi No]

İŞÇİ: [İşçi Ad Soyad]
Adres: [İşçi Adresi]
T.C. Kimlik No: [İşçi T.C. No]

KONU: Uzaktan çalışma sözleşmesi

MADDELER:

1. İŞ TANIMI
İşçi, [Pozisyon] pozisyonunda uzaktan çalışacaktır.

2. ÇALIŞMA YERİ
İşçi, [Çalışma Yeri] adresinde çalışacaktır.

3. ÇALIŞMA SÜRESİ
İşçi, haftada [Haftalık Çalışma Saati] saat çalışacaktır.

4. MAAŞ
İşçiye aylık [Maaş Miktarı] TL maaş ödenecektir.

5. İŞE BAŞLAMA TARİHİ
İşçi, [İşe Başlama Tarihi] tarihinde işe başlayacaktır.

6. ÇALIŞMA SAATLERİ
İşçi, [Çalışma Saatleri] saatlerinde çalışacaktır.

7. İLETİŞİM
İşçi, [İletişim Yöntemi] ile işverenle iletişim kuracaktır.

8. İŞÇİ HAKLARI
İşçi, İş Kanunu'nda belirtilen tüm haklara sahiptir.

9. FESİH
Bu sözleşme, İş Kanunu hükümlerine göre feshedilebilir.

10. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, İş Mahkemesi'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

İŞVEREN                    İŞÇİ
[İmza]                    [İmza]`,
    requiredFields: ['İşveren Ad Soyad/Şirket Adı', 'İşveren Adresi', 'İşçi Ad Soyad', 'İşçi Adresi', 'Pozisyon', 'Maaş Miktarı', 'İşe Başlama Tarihi', 'Çalışma Yeri', 'Çalışma Saatleri', 'İletişim Yöntemi'],
    legalBasis: ['İş Kanunu 8', 'İş Kanunu 17', 'İş Kanunu 25'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },
  // TİCARET HUKUKU - ŞİRKET
  {
    id: 'anonim-sirket-sozlesmesi',
    title: 'Anonim Şirket Sözleşmesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Anonim şirket kuruluş sözleşmesi',
    keywords: ['anonim', 'şirket', 'kuruluş', 'ticaret', 'ortaklık'],
    content: `ANONİM ŞİRKET SÖZLEŞMESİ

ŞİRKET ADI: [Şirket Adı]
ŞİRKET MERKEZİ: [Şirket Merkezi]
ŞİRKET KONUSU: [Şirket Konusu]
SERMAYE: [Sermaye Miktarı] TL

ORTAKLAR:
1. [Ortak 1 Ad Soyad] - [Ortak 1 Pay Miktarı] pay
2. [Ortak 2 Ad Soyad] - [Ortak 2 Pay Miktarı] pay
3. [Ortak 3 Ad Soyad] - [Ortak 3 Pay Miktarı] pay

MADDELER:

1. ŞİRKET ADI VE MERKEZİ
Şirketin adı [Şirket Adı]'dır. Merkezi [Şirket Merkezi]'dir.

2. ŞİRKET KONUSU
Şirketin konusu [Şirket Konusu]'dur.

3. SERMAYE
Şirketin sermayesi [Sermaye Miktarı] TL'dir.

4. PAYLAR
Şirketin payları [Pay Sayısı] adet olup, her pay [Pay Değeri] TL değerindedir.

5. YÖNETİM
Şirket, [Yönetim Kurulu Üye Sayısı] kişilik yönetim kurulu tarafından yönetilir.

6. DENETİM
Şirket, [Denetim Kurulu Üye Sayısı] kişilik denetim kurulu tarafından denetlenir.

7. KAR DAĞITIMI
Şirketin karı, pay sahiplerine pay oranlarında dağıtılır.

8. FESİH
Şirket, Ticaret Kanunu hükümlerine göre feshedilebilir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

ORTAKLAR:
[Ortak 1 İmza]    [Ortak 2 İmza]    [Ortak 3 İmza]`,
    requiredFields: ['Şirket Adı', 'Şirket Merkezi', 'Şirket Konusu', 'Sermaye Miktarı', 'Pay Sayısı', 'Pay Değeri', 'Yönetim Kurulu Üye Sayısı', 'Denetim Kurulu Üye Sayısı'],
    legalBasis: ['Ticaret Kanunu 332', 'Ticaret Kanunu 340', 'Ticaret Kanunu 350'],
    contractType: 'Şirket Sözleşmesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.4
  },
  {
    id: 'limited-sirket-sozlesmesi',
    title: 'Limited Şirket Sözleşmesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Limited şirket kuruluş sözleşmesi',
    keywords: ['limited', 'şirket', 'kuruluş', 'ticaret', 'ortaklık'],
    content: `LİMİTED ŞİRKET SÖZLEŞMESİ

ŞİRKET ADI: [Şirket Adı]
ŞİRKET MERKEZİ: [Şirket Merkezi]
ŞİRKET KONUSU: [Şirket Konusu]
SERMAYE: [Sermaye Miktarı] TL

ORTAKLAR:
1. [Ortak 1 Ad Soyad] - [Ortak 1 Pay Miktarı] pay
2. [Ortak 2 Ad Soyad] - [Ortak 2 Pay Miktarı] pay
3. [Ortak 3 Ad Soyad] - [Ortak 3 Pay Miktarı] pay

MADDELER:

1. ŞİRKET ADI VE MERKEZİ
Şirketin adı [Şirket Adı]'dır. Merkezi [Şirket Merkezi]'dir.

2. ŞİRKET KONUSU
Şirketin konusu [Şirket Konusu]'dur.

3. SERMAYE
Şirketin sermayesi [Sermaye Miktarı] TL'dir.

4. PAYLAR
Şirketin payları [Pay Sayısı] adet olup, her pay [Pay Değeri] TL değerindedir.

5. YÖNETİM
Şirket, [Yönetim Kurulu Üye Sayısı] kişilik yönetim kurulu tarafından yönetilir.

6. DENETİM
Şirket, [Denetim Kurulu Üye Sayısı] kişilik denetim kurulu tarafından denetlenir.

7. KAR DAĞITIMI
Şirketin karı, pay sahiplerine pay oranlarında dağıtılır.

8. FESİH
Şirket, Ticaret Kanunu hükümlerine göre feshedilebilir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

ORTAKLAR:
[Ortak 1 İmza]    [Ortak 2 İmza]    [Ortak 3 İmza]`,
    requiredFields: ['Şirket Adı', 'Şirket Merkezi', 'Şirket Konusu', 'Sermaye Miktarı', 'Pay Sayısı', 'Pay Değeri', 'Yönetim Kurulu Üye Sayısı', 'Denetim Kurulu Üye Sayısı'],
    legalBasis: ['Ticaret Kanunu 580', 'Ticaret Kanunu 590', 'Ticaret Kanunu 600'],
    contractType: 'Şirket Sözleşmesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },
  // BORÇLAR HUKUKU - SATIŞ
  {
    id: 'satis-sozlesmesi',
    title: 'Satış Sözleşmesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Satış',
    description: 'Genel satış sözleşmesi şablonu',
    keywords: ['satış', 'sözleşme', 'mal', 'alım', 'satım'],
    content: `SATIŞ SÖZLEŞMESİ

SATICI: [Satıcı Ad Soyad]
Adres: [Satıcı Adresi]
T.C. Kimlik No: [Satıcı T.C. No]

ALICI: [Alıcı Ad Soyad]
Adres: [Alıcı Adresi]
T.C. Kimlik No: [Alıcı T.C. No]

KONU: Satış sözleşmesi

MADDELER:

1. SATILAN MAL
Satılan mal: [Mal Açıklaması]
Miktar: [Mal Miktarı]
Birim fiyat: [Birim Fiyat] TL
Toplam fiyat: [Toplam Fiyat] TL

2. ÖDEME
Alıcı, mal bedelini [Ödeme Şekli] ile ödeyecektir.

3. TESLİM
Mal, [Teslim Yeri]'nde teslim edilecektir.

4. TESLİM TARİHİ
Mal, [Teslim Tarihi] tarihinde teslim edilecektir.

5. MALIN MÜLKİYETİ
Malın mülkiyeti, ödeme yapıldığında alıcıya geçer.

6. GARANTİ
Satıcı, malın [Garanti Süresi] süreyle garantisini verir.

7. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, [Uyuşmazlık Çözüm Yeri]'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

SATICI                    ALICI
[İmza]                    [İmza]`,
    requiredFields: ['Satıcı Ad Soyad', 'Satıcı Adresi', 'Alıcı Ad Soyad', 'Alıcı Adresi', 'Mal Açıklaması', 'Mal Miktarı', 'Birim Fiyat', 'Toplam Fiyat', 'Ödeme Şekli', 'Teslim Yeri', 'Teslim Tarihi'],
    legalBasis: ['TBK 207', 'TBK 208', 'TBK 209'],
    contractType: 'Satış Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.7
  },
  {
    id: 'kira-sozlesmesi',
    title: 'Kira Sözleşmesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Kira',
    description: 'Genel kira sözleşmesi şablonu',
    keywords: ['kira', 'sözleşme', 'kiralama', 'kiracı', 'kira veren'],
    content: `KİRA SÖZLEŞMESİ

KİRA VEREN: [Kira Veren Ad Soyad]
Adres: [Kira Veren Adresi]
T.C. Kimlik No: [Kira Veren T.C. No]

KİRACI: [Kiracı Ad Soyad]
Adres: [Kiracı Adresi]
T.C. Kimlik No: [Kiracı T.C. No]

KONU: Kira sözleşmesi

MADDELER:

1. KİRALANAN MAL
Kiralanan mal: [Kiralanan Mal Açıklaması]
Adres: [Kiralanan Mal Adresi]

2. KİRA BEDELİ
Aylık kira bedeli: [Aylık Kira Bedeli] TL

3. KİRA SÜRESİ
Kira süresi: [Kira Süresi] ay

4. BAŞLANGIÇ TARİHİ
Kira süresi [Başlangıç Tarihi] tarihinde başlar.

5. BİTİŞ TARİHİ
Kira süresi [Bitiş Tarihi] tarihinde biter.

6. ÖDEME
Kira bedeli, her ayın [Ödeme Günü]'nde ödenecektir.

7. DEPOZİTO
Kiracı, [Depozito Miktarı] TL depozito ödeyecektir.

8. KİRACI YÜKÜMLÜLÜKLERİ
Kiracı, kiralanan malı özenle kullanacak ve koruyacaktır.

9. KİRA VEREN YÜKÜMLÜLÜKLERİ
Kira veren, kiralanan malı kullanıma hazır halde teslim edecektir.

10. FESİH
Bu sözleşme, [Fesih Şartları] şartlarında feshedilebilir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

KİRA VEREN                KİRACI
[İmza]                    [İmza]`,
    requiredFields: ['Kira Veren Ad Soyad', 'Kira Veren Adresi', 'Kiracı Ad Soyad', 'Kiracı Adresi', 'Kiralanan Mal Açıklaması', 'Kiralanan Mal Adresi', 'Aylık Kira Bedeli', 'Kira Süresi', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Ödeme Günü', 'Depozito Miktarı'],
    legalBasis: ['TBK 299', 'TBK 300', 'TBK 301'],
    contractType: 'Kira Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },
  {
    id: 'hizmet-sozlesmesi',
    title: 'Hizmet Sözleşmesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Hizmet',
    description: 'Genel hizmet sözleşmesi şablonu',
    keywords: ['hizmet', 'sözleşme', 'hizmet veren', 'hizmet alan'],
    content: `HİZMET SÖZLEŞMESİ

HİZMET VEREN: [Hizmet Veren Ad Soyad]
Adres: [Hizmet Veren Adresi]
T.C. Kimlik No: [Hizmet Veren T.C. No]

HİZMET ALAN: [Hizmet Alan Ad Soyad]
Adres: [Hizmet Alan Adresi]
T.C. Kimlik No: [Hizmet Alan T.C. No]

KONU: Hizmet sözleşmesi

MADDELER:

1. HİZMET KONUSU
Hizmet konusu: [Hizmet Konusu]
Hizmet detayları: [Hizmet Detayları]

2. HİZMET BEDELİ
Hizmet bedeli: [Hizmet Bedeli] TL

3. HİZMET SÜRESİ
Hizmet süresi: [Hizmet Süresi]

4. BAŞLANGIÇ TARİHİ
Hizmet [Başlangıç Tarihi] tarihinde başlar.

5. BİTİŞ TARİHİ
Hizmet [Bitiş Tarihi] tarihinde biter.

6. ÖDEME
Hizmet bedeli, [Ödeme Şekli] ile ödenecektir.

7. HİZMET VEREN YÜKÜMLÜLÜKLERİ
Hizmet veren, hizmeti [Hizmet Kalitesi] kalitesinde sunacaktır.

8. HİZMET ALAN YÜKÜMLÜLÜKLERİ
Hizmet alan, hizmet bedelini zamanında ödeyecektir.

9. FESİH
Bu sözleşme, [Fesih Şartları] şartlarında feshedilebilir.

10. UYUŞMAZLIK ÇÖZÜMÜ
Taraflar arasında çıkacak uyuşmazlıklar, [Uyuşmazlık Çözüm Yeri]'nde çözülecektir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

HİZMET VEREN              HİZMET ALAN
[İmza]                    [İmza]`,
    requiredFields: ['Hizmet Veren Ad Soyad', 'Hizmet Veren Adresi', 'Hizmet Alan Ad Soyad', 'Hizmet Alan Adresi', 'Hizmet Konusu', 'Hizmet Detayları', 'Hizmet Bedeli', 'Hizmet Süresi', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Ödeme Şekli', 'Hizmet Kalitesi'],
    legalBasis: ['TBK 609', 'TBK 610', 'TBK 611'],
    contractType: 'Hizmet Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },
  // GAYRİMENKUL - KİRA
  {
    id: 'konut-kira-sozlesmesi',
    title: 'Konut Kira Sözleşmesi',
    category: 'Gayrimenkul',
    subcategory: 'Kira',
    description: 'Konut kira sözleşmesi şablonu',
    keywords: ['konut', 'kira', 'sözleşme', 'ev', 'daire'],
    content: `KONUT KİRA SÖZLEŞMESİ

KİRA VEREN: [Kira Veren Ad Soyad]
Adres: [Kira Veren Adresi]
T.C. Kimlik No: [Kira Veren T.C. No]

KİRACI: [Kiracı Ad Soyad]
Adres: [Kiracı Adresi]
T.C. Kimlik No: [Kiracı T.C. No]

KONU: Konut kira sözleşmesi

MADDELER:

1. KİRALANAN KONUT
Kiralanan konut: [Konut Açıklaması]
Adres: [Konut Adresi]
Oda sayısı: [Oda Sayısı]
Metrekare: [Metrekare] m²

2. KİRA BEDELİ
Aylık kira bedeli: [Aylık Kira Bedeli] TL

3. KİRA SÜRESİ
Kira süresi: [Kira Süresi] ay

4. BAŞLANGIÇ TARİHİ
Kira süresi [Başlangıç Tarihi] tarihinde başlar.

5. BİTİŞ TARİHİ
Kira süresi [Bitiş Tarihi] tarihinde biter.

6. ÖDEME
Kira bedeli, her ayın [Ödeme Günü]'nde ödenecektir.

7. DEPOZİTO
Kiracı, [Depozito Miktarı] TL depozito ödeyecektir.

8. KİRACI YÜKÜMLÜLÜKLERİ
Kiracı, konutu özenle kullanacak ve koruyacaktır.

9. KİRA VEREN YÜKÜMLÜLÜKLERİ
Kira veren, konutu kullanıma hazır halde teslim edecektir.

10. FESİH
Bu sözleşme, [Fesih Şartları] şartlarında feshedilebilir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

KİRA VEREN                KİRACI
[İmza]                    [İmza]`,
    requiredFields: ['Kira Veren Ad Soyad', 'Kira Veren Adresi', 'Kiracı Ad Soyad', 'Kiracı Adresi', 'Konut Açıklaması', 'Konut Adresi', 'Oda Sayısı', 'Metrekare', 'Aylık Kira Bedeli', 'Kira Süresi', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Ödeme Günü', 'Depozito Miktarı'],
    legalBasis: ['TBK 299', 'TBK 300', 'TBK 301'],
    contractType: 'Konut Kira Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.8
  },
  {
    id: 'ticari-kira-sozlesmesi',
    title: 'Ticari Kira Sözleşmesi',
    category: 'Gayrimenkul',
    subcategory: 'Kira',
    description: 'Ticari kira sözleşmesi şablonu',
    keywords: ['ticari', 'kira', 'sözleşme', 'iş yeri', 'dükkan'],
    content: `TİCARİ KİRA SÖZLEŞMESİ

KİRA VEREN: [Kira Veren Ad Soyad]
Adres: [Kira Veren Adresi]
T.C. Kimlik No: [Kira Veren T.C. No]

KİRACI: [Kiracı Ad Soyad]
Adres: [Kiracı Adresi]
T.C. Kimlik No: [Kiracı T.C. No]

KONU: Ticari kira sözleşmesi

MADDELER:

1. KİRALANAN TİCARİ ALAN
Kiralanan ticari alan: [Ticari Alan Açıklaması]
Adres: [Ticari Alan Adresi]
Metrekare: [Metrekare] m²

2. KİRA BEDELİ
Aylık kira bedeli: [Aylık Kira Bedeli] TL

3. KİRA SÜRESİ
Kira süresi: [Kira Süresi] ay

4. BAŞLANGIÇ TARİHİ
Kira süresi [Başlangıç Tarihi] tarihinde başlar.

5. BİTİŞ TARİHİ
Kira süresi [Bitiş Tarihi] tarihinde biter.

6. ÖDEME
Kira bedeli, her ayın [Ödeme Günü]'nde ödenecektir.

7. DEPOZİTO
Kiracı, [Depozito Miktarı] TL depozito ödeyecektir.

8. KİRACI YÜKÜMLÜLÜKLERİ
Kiracı, ticari alanı özenle kullanacak ve koruyacaktır.

9. KİRA VEREN YÜKÜMLÜLÜKLERİ
Kira veren, ticari alanı kullanıma hazır halde teslim edecektir.

10. FESİH
Bu sözleşme, [Fesih Şartları] şartlarında feshedilebilir.

Bu sözleşme [Tarih] tarihinde imzalanmıştır.

KİRA VEREN                KİRACI
[İmza]                    [İmza]`,
    requiredFields: ['Kira Veren Ad Soyad', 'Kira Veren Adresi', 'Kiracı Ad Soyad', 'Kiracı Adresi', 'Ticari Alan Açıklaması', 'Ticari Alan Adresi', 'Metrekare', 'Aylık Kira Bedeli', 'Kira Süresi', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Ödeme Günü', 'Depozito Miktarı'],
    legalBasis: ['TBK 299', 'TBK 300', 'TBK 301'],
    contractType: 'Ticari Kira Sözleşmesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.7
  }
];

export const getContractsByCategory = (category: string): ContractTemplate[] => {
  return contractTemplates.filter(contract => contract.category === category);
};

export const getContractsBySubcategory = (category: string, subcategory: string): ContractTemplate[] => {
  return contractTemplates.filter(contract => 
    contract.category === category && contract.subcategory === subcategory
  );
};

export const searchContracts = (query: string): ContractTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return contractTemplates.filter(contract => 
    contract.title.toLowerCase().includes(lowercaseQuery) ||
    contract.description.toLowerCase().includes(lowercaseQuery) ||
    contract.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};

export const getContractById = (id: string): ContractTemplate | undefined => {
  return contractTemplates.find(contract => contract.id === id);
};

export const getPopularContracts = (): ContractTemplate[] => {
  return contractTemplates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
};

export const getRecentContracts = (): ContractTemplate[] => {
  return contractTemplates
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 10);
};
