export interface PetitionTemplate {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  keywords: string[];
  content: string;
  requiredFields: string[];
  legalBasis: string[];
  courtType: string;
  estimatedTime: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  lastUpdated: string;
  usageCount: number;
  rating: number;
}

export const petitionCategories = {
  'Aile Hukuku': {
    'Boşanma': ['anlasmali-bosanma', 'haysiyetsizlik-bosanma', 'ayrilik-istemli', 'evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi'],
    'Velayet': ['velayet-degisikligi', 'cocukla-kisisel-iliskinin-yeniden-duzenlenmesi', 'velayet-kaldirma'],
    'Nafaka': ['nafaka-artirimi', 'istirak-nafakasi-arttirimi', 'tedbir-nafakasi', 'nafaka-kesme'],
    'Evlilik': ['evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi', 'evlilik-oncesi-sozlesme']
  },
  'Medeni Hukuk': {
    'Miras': ['veraset-ilaminin-iptali', 'veraset-ilaminin-duzeltilmesi', 'veraset-belgesi-verilmesi', 'mirasin-reddinin-tescili', 'olumun-tesbiti', 'miras-payi-artirimi'],
    'Tapu': ['tapu-iptali-ve-tescil', 'kat-mulkiyetinin-devri', 'kat-irtifakinin-devri', 'tapu-düzeltme'],
    'Mülkiyet': ['ortak-yere-ayrilan-arsa-payinin-iptali', 'ortak-yere-yapilan-mudahalenin-onlenmesi', 'fuzuli-isgal', 'mulkiyet-tescil']
  },
  'Borçlar Hukuku': {
    'Alacak': ['alacak-davasi', 'temerrut-nedeni-ile-alacak-davasi', 'alacak-takibi', 'borc-odeme'],
    'Sözleşme': ['kira-bedelinin-attirilmasi', 'kiranin-yeni-kosullara-uyarlanmasi', 'sozlesme-iptali', 'sozlesme-feshi'],
    'Tazminat': ['maddi-tazminat', 'maddi-ve-manevi-tazminat', 'trafik-kazasi-nedeniyle-maddi-tazminat', 'manevi-tazminat']
  },
  'İş Hukuku': {
    'İş Sözleşmesi': ['calisma-izni-talebi', 'is-sozlesmesi-iptali', 'is-sozlesmesi-feshi', 'is-sozlesmesi-degisiklik'],
    'İşçi Hakları': ['mazeret-dilekcesi', 'isci-haklari-talebi', 'isci-tazminati', 'isci-kidemi'],
    'İş Güvenliği': ['is-guvenligi-talebi', 'is-kazasi-tazminati', 'meslek-hastaligi', 'is-yeri-kapatma']
  },
  'İcra ve İflas': {
    'İcra': ['cek-iptali', 'cek-odeme-yasagi', 'menfi-tesbit-ve-icra-takibinin-durdurulmasi', 'icra-takibi'],
    'İflas': ['konkordatonun-feshi', 'iflas-talebi', 'iflas-iptali', 'konkordato-talebi'],
    'Rehin': ['rehin-iptali', 'rehin-tescil', 'rehin-devri', 'rehin-kaldirma']
  },
  'Ceza Hukuku': {
    'Şikayet': ['savciliga-sikayet-dilekcesi', 'sikayet-iptali', 'sikayet-artirimi', 'sikayet-degisiklik'],
    'Koruma': ['ailenin-korunmasi-icin-tedbir', 'valilik-koruma-talebi', 'koruma-karari', 'koruma-genisleme'],
    'Suç': ['suç-duyurusu', 'suç-tanimi', 'suç-delili', 'suç-ittifaki']
  },
  'İdare Hukuku': {
    'Vergi': ['vergi-dairesi-uzlasma', 'vergi-iptali', 'vergi-düzeltme', 'vergi-beyani'],
    'Kamulaştırma': ['kamulastirilan-tasinmazin-iade-adina-tescili', 'kamulastirilma-bedelinin-arttilmasi', 'kamulastirma-iptali', 'kamulastirma-bedeli'],
    'İdari İşlem': ['idari-islem-iptali', 'idari-islem-düzeltme', 'idari-islem-susma', 'idari-islem-yeniden']
  },
  'Ticaret Hukuku': {
    'Şirket': ['sirketin-feshi-dava', 'sirket-kurulus', 'sirket-degisiklik', 'sirket-birlesme'],
    'Rekabet': ['haksiz-rekabetin-onlenmesi', 'rekabet-hukuku', 'rekabet-iptali', 'rekabet-düzeltme'],
    'Ticari İşlem': ['ticari-islem-iptali', 'ticari-islem-feshi', 'ticari-islem-degisiklik', 'ticari-islem-yeniden']
  }
};

export const petitionTemplates: PetitionTemplate[] = [
  // AİLE HUKUKU - BOŞANMA
  {
    id: 'anlasmali-bosanma',
    title: 'Anlaşmalı Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    description: 'Eşlerin karşılıklı rızaları ile boşanma talebi',
    keywords: ['boşanma', 'anlaşmalı', 'evlilik', 'ayrılık'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Anlaşmalı boşanma davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Evlilik süresince eşler arasında geçimsizlik nedeniyle ortak yaşam mümkün olmamıştır.

3. Taraflar, evlilik birliğinin temelinden sarsıldığı konusunda anlaşmışlardır.

4. Boşanma sonrası mal rejimi, nafaka ve çocukların durumu konularında anlaşma sağlanmıştır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 166. maddesi

SONUÇ VE TALEP: Yukarıdaki açıklamalar çerçevesinde, evlilik birliğinin temelinden sarsıldığı gerekçesiyle boşanma kararı verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Anlaşma Detayları'],
    legalBasis: ['TMK 166', 'TMK 167'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.8
  },
  {
    id: 'haysiyetsizlik-bosanma',
    title: 'Haysiyetsizlik Nedeniyle Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    description: 'Eşin haysiyetsiz davranışları nedeniyle boşanma talebi',
    keywords: ['boşanma', 'haysiyetsizlik', 'evlilik', 'ayrılık'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Haysiyetsizlik nedeniyle boşanma davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Davalı, evlilik süresince [Haysiyetsizlik Detayları] şeklinde haysiyetsiz davranışlarda bulunmuştur.

3. Bu davranışlar evlilik birliğinin temelinden sarsılmasına neden olmuştur.

4. Davacı, davalının bu davranışları nedeniyle evlilik birliğini sürdüremeyecek duruma gelmiştir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 165. maddesi

SONUÇ VE TALEP: Davalının haysiyetsiz davranışları nedeniyle boşanma kararı verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Haysiyetsizlik Detayları'],
    legalBasis: ['TMK 165', 'TMK 166'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },
  {
    id: 'ayrilik-istemli',
    title: 'Ayrılık İstemli Dava Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    description: 'Ayrılık süresi sonrası boşanma talebi',
    keywords: ['boşanma', 'ayrılık', 'evlilik', 'istek'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Ayrılık istemli dava

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. [Ayrılık Tarihi] tarihinde ayrılık kararı verilmiştir.

3. Ayrılık süresi tamamlanmış olup, taraflar arasında uzlaşma sağlanamamıştır.

4. Evlilik birliğinin devamı mümkün değildir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 168. maddesi

SONUÇ VE TALEP: Ayrılık süresinin tamamlanması nedeniyle boşanma kararı verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Ayrılık Tarihi'],
    legalBasis: ['TMK 168', 'TMK 169'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '45-60 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },
  {
    id: 'evliligin-butlani',
    title: 'Evliliğin Butlanı Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Evlilik',
    description: 'Evliliğin geçersizliği talebi',
    keywords: ['evlilik', 'butlan', 'geçersizlik', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Evliliğin butlanı davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Evlilik sırasında [Butlan Nedeni] nedeniyle evlilik geçersizdir.

3. Bu durum evliliğin temelinden sarsılmasına neden olmuştur.

4. Evliliğin butlanına karar verilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 145. maddesi

SONUÇ VE TALEP: Evliliğin butlanına karar verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Butlan Nedeni'],
    legalBasis: ['TMK 145', 'TMK 146'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'evlenmenin-men-i',
    title: 'Evlenmenin Men\'i Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Evlilik',
    description: 'Evlenmenin engellenmesi talebi',
    keywords: ['evlilik', 'men', 'engelleme', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Evlenmenin men'i davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Evlilik sırasında [Men Nedeni] nedeniyle evlilik engellenmelidir.

3. Bu durum evliliğin temelinden sarsılmasına neden olmuştur.

4. Evlenmenin men'ine karar verilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 147. maddesi

SONUÇ VE TALEP: Evlenmenin men'ine karar verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Men Nedeni'],
    legalBasis: ['TMK 147', 'TMK 148'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  {
    id: 'gaiplik-nedeni-ile-evliligin-feshi',
    title: 'Gaiplik Nedeniyle Evliliğin Feshi Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Evlilik',
    description: 'Eşin gaipliği nedeniyle evliliğin feshi',
    keywords: ['evlilik', 'gaiplik', 'fesih', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Gaiplik nedeniyle evliliğin feshi davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Davalı, [Gaiplik Tarihi] tarihinden itibaren gaip durumundadır.

3. Davalı hakkında [Gaiplik Süresi] süre boyunca hiçbir haber alınamamıştır.

4. Bu durum evliliğin feshini gerektirmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 31. maddesi

SONUÇ VE TALEP: Gaiplik nedeniyle evliliğin feshine karar verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Gaiplik Tarihi', 'Gaiplik Süresi'],
    legalBasis: ['TMK 31', 'TMK 32'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.9
  },
  // AİLE HUKUKU - VELAYET
  {
    id: 'velayet-degisikligi',
    title: 'Velayet Değişikliği Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    description: 'Çocuğun velayetinin değiştirilmesi talebi',
    keywords: ['velayet', 'çocuk', 'değişiklik', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Velayet değişikliği davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiş ve çocuğun velayeti davalıya verilmiştir.

2. Çocuğun yüksek yararı gözetilerek velayetin davacıya verilmesi gerekmektedir.

3. Davalının çocuğa bakım konusunda yetersiz kaldığı tespit edilmiştir.

4. [Çocuk Bilgileri] yaşındaki çocuğun davacı ile yaşaması daha uygun olacaktır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 182. maddesi

SONUÇ VE TALEP: Çocuğun yüksek yararı gereği velayetin davacıya verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çocuk Bilgileri', 'Boşanma Tarihi'],
    legalBasis: ['TMK 182', 'TMK 183'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },
  {
    id: 'cocukla-kisisel-iliskinin-yeniden-duzenlenmesi',
    title: 'Çocukla Kişisel İlişkinin Yeniden Düzenlenmesi Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    description: 'Çocukla görüşme hakkının düzenlenmesi',
    keywords: ['velayet', 'çocuk', 'görüşme', 'kişisel ilişki'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Çocukla kişisel ilişkinin yeniden düzenlenmesi

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiştir.

2. Çocuğun velayeti davalıya verilmiştir.

3. Davacının çocukla kişisel ilişkisi [Mevcut Düzenleme] şeklinde düzenlenmiştir.

4. Bu düzenleme çocuğun yüksek yararına aykırıdır ve değiştirilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 183. maddesi

SONUÇ VE TALEP: Çocukla kişisel ilişkinin [Yeni Düzenleme] şeklinde yeniden düzenlenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çocuk Bilgileri', 'Mevcut Düzenleme', 'Yeni Düzenleme'],
    legalBasis: ['TMK 183', 'TMK 184'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '45-60 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.4
  },
  {
    id: 'velayet-kaldirma',
    title: 'Velayet Kaldırma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    description: 'Velayetin kaldırılması talebi',
    keywords: ['velayet', 'kaldırma', 'çocuk', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Velayet kaldırma davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiştir.

2. Çocuğun velayeti davalıya verilmiştir.

3. Davalının velayet görevini yerine getirmediği tespit edilmiştir.

4. [Velayet Kaldırma Nedeni] nedeniyle velayetin kaldırılması gerekmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 182. maddesi

SONUÇ VE TALEP: Velayetin kaldırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çocuk Bilgileri', 'Boşanma Tarihi', 'Velayet Kaldırma Nedeni'],
    legalBasis: ['TMK 182', 'TMK 183'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  // AİLE HUKUKU - NAFAKA
  {
    id: 'nafaka-artirimi',
    title: 'Nafaka Artırımı Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Mevcut nafaka miktarının artırılması talebi',
    keywords: ['nafaka', 'artırım', 'aile', 'destek'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Nafaka artırımı davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiş ve davalıya nafaka yükümlülüğü getirilmiştir.

2. Ekonomik koşulların değişmesi nedeniyle mevcut nafaka miktarı yetersiz kalmıştır.

3. Davacının yaşam standartları ve ihtiyaçları artmıştır.

4. Davalının ekonomik durumu iyileşmiştir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 175. maddesi

SONUÇ VE TALEP: Nafaka miktarının [Talep Edilen Miktar] TL'ye artırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Mevcut Nafaka Miktarı', 'Talep Edilen Miktar'],
    legalBasis: ['TMK 175', 'TMK 176'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '45-60 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },
  {
    id: 'istirak-nafakasi-arttirimi',
    title: 'İştirak Nafakası Artırımı Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Çocuk nafakasının artırılması talebi',
    keywords: ['nafaka', 'çocuk', 'iştirak', 'artırım'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: İştirak nafakası artırımı davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiştir.

2. Çocuğun velayeti davacıya verilmiştir.

3. Davalıya çocuk için iştirak nafakası yükümlülüğü getirilmiştir.

4. Çocuğun ihtiyaçları artmış ve mevcut nafaka miktarı yetersiz kalmıştır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 182. maddesi

SONUÇ VE TALEP: İştirak nafakasının [Talep Edilen Miktar] TL'ye artırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çocuk Bilgileri', 'Mevcut Nafaka Miktarı', 'Talep Edilen Miktar'],
    legalBasis: ['TMK 182', 'TMK 183'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '45-60 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  {
    id: 'tedbir-nafakasi',
    title: 'Tedbir Nafakası Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Boşanma davası süresince geçici nafaka talebi',
    keywords: ['nafaka', 'tedbir', 'geçici', 'boşanma'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Tedbir nafakası talebi

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Evlilik Tarihi] tarihinde evlilik akdi yapılmıştır.

2. Davacı, davalı aleyhine boşanma davası açmıştır.

3. Davacı, ekonomik durumu nedeniyle geçim sıkıntısı yaşamaktadır.

4. Davalının ekonomik durumu iyidir ve tedbir nafakası ödeme gücü vardır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 169. maddesi

SONUÇ VE TALEP: Boşanma davası süresince [Talep Edilen Miktar] TL tedbir nafakası verilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Evlilik Tarihi', 'Talep Edilen Miktar'],
    legalBasis: ['TMK 169', 'TMK 170'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '30-45 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'nafaka-kesme',
    title: 'Nafaka Kesme Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Nafaka yükümlülüğünün kaldırılması talebi',
    keywords: ['nafaka', 'kesme', 'kaldırma', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Nafaka kesme davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Boşanma Tarihi] tarihinde boşanma gerçekleşmiştir.

2. Davacıya nafaka yükümlülüğü getirilmiştir.

3. [Nafaka Kesme Nedeni] nedeniyle nafaka yükümlülüğünün kaldırılması gerekmektedir.

4. Davalının ekonomik durumu değişmiştir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 175. maddesi

SONUÇ VE TALEP: Nafaka yükümlülüğünün kaldırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Boşanma Tarihi', 'Nafaka Kesme Nedeni'],
    legalBasis: ['TMK 175', 'TMK 176'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '45-60 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  // MEDENİ HUKUK - MİRAS
  {
    id: 'veraset-ilaminin-iptali',
    title: 'Veraset İlamının İptali Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Miras',
    description: 'Yanlış veraset ilamının iptali talebi',
    keywords: ['veraset', 'ilam', 'iptal', 'miras'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Veraset ilamının iptali davası

AÇIKLAMALAR:

1. [Mirasçı Ad Soyad] adlı kişi [Ölüm Tarihi] tarihinde vefat etmiştir.

2. Davalı, [Veraset İlamı Tarihi] tarihinde veraset ilamı almıştır.

3. Bu veraset ilamı yanlış olup, davacının miras hakkı göz ardı edilmiştir.

4. Davacı, gerçek mirasçı olup veraset ilamında yer alması gerekmektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 495. maddesi

SONUÇ VE TALEP: Veraset ilamının iptal edilmesini ve davacının mirasçı olarak tespit edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Mirasçı Ad Soyad', 'Ölüm Tarihi', 'Veraset İlamı Tarihi'],
    legalBasis: ['TMK 495', 'TMK 496'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  {
    id: 'mirasin-reddinin-tescili',
    title: 'Mirasın Reddinin Tescili Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Miras',
    description: 'Mirası reddetme talebi',
    keywords: ['miras', 'red', 'tescil', 'vazgeçme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]

KONU: Mirasın reddinin tescili

AÇIKLAMALAR:

1. [Mirasçı Ad Soyad] adlı kişi [Ölüm Tarihi] tarihinde vefat etmiştir.

2. Davacı, vefat edenin [Akrabalık Derecesi] derece mirasçısıdır.

3. Vefat edenin borçları, mirasından fazla olduğu tespit edilmiştir.

4. Davacı, mirası reddetmek istemektedir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 605. maddesi

SONUÇ VE TALEP: Mirasın reddinin tescili edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Mirasçı Ad Soyad', 'Ölüm Tarihi', 'Akrabalık Derecesi'],
    legalBasis: ['TMK 605', 'TMK 606'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  {
    id: 'olumun-tesbiti',
    title: 'Ölümün Tespiti Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Miras',
    description: 'Kayıp kişinin ölümünün tespiti talebi',
    keywords: ['ölüm', 'tespit', 'kayıp', 'miras'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]

KONU: Ölümün tespiti davası

AÇIKLAMALAR:

1. [Kayıp Kişi Ad Soyad] adlı kişi [Kaybolma Tarihi] tarihinden itibaren kayıptır.

2. Davacı, kayıp kişinin [Akrabalık Derecesi] derece mirasçısıdır.

3. Kayıp kişi hakkında [Kaybolma Süresi] süre boyunca hiçbir haber alınamamıştır.

4. Kayıp kişinin ölümü kuvvetle muhtemeldir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 31. maddesi

SONUÇ VE TALEP: Kayıp kişinin ölümünün tespit edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Kayıp Kişi Ad Soyad', 'Kaybolma Tarihi', 'Akrabalık Derecesi', 'Kaybolma Süresi'],
    legalBasis: ['TMK 31', 'TMK 32'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.8
  },
  // BORÇLAR HUKUKU - ALACAK
  {
    id: 'alacak-davasi',
    title: 'Alacak Davası Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Alacak',
    description: 'Borçluya karşı alacak talebi',
    keywords: ['alacak', 'borç', 'ödeme', 'tazminat'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Alacak davası

AÇIKLAMALAR:

1. Davalı, davacıya [Borçlanma Tarihi] tarihinde [Borç Miktarı] TL borçlanmıştır.

2. Borcun ödeme tarihi [Ödeme Tarihi] olarak belirlenmiştir.

3. Davalı, belirlenen tarihte borcunu ödememiştir.

4. Davacı, alacağını talep etmesine rağmen davalı ödeme yapmamıştır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 125. maddesi

SONUÇ VE TALEP: Davalıdan [Borç Miktarı] TL'nin ödenmesini ve gecikme faizi ile birlikte tahsilini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Borç Miktarı', 'Borçlanma Tarihi', 'Ödeme Tarihi'],
    legalBasis: ['TBK 125', 'TBK 126'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },
  {
    id: 'temerrut-nedeni-ile-alacak-davasi',
    title: 'Temerrüt Nedeniyle Alacak Davası Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Alacak',
    description: 'Borçlunun temerrüde düşmesi nedeniyle alacak talebi',
    keywords: ['alacak', 'temerrüt', 'borç', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Temerrüt nedeniyle alacak davası

AÇIKLAMALAR:

1. Davalı, davacıya [Borçlanma Tarihi] tarihinde [Borç Miktarı] TL borçlanmıştır.

2. Borcun ödeme tarihi [Ödeme Tarihi] olarak belirlenmiştir.

3. Davalı, belirlenen tarihte borcunu ödememiş ve temerrüde düşmüştür.

4. Davacı, davalıya ihtarname göndermiş ancak ödeme yapılmamıştır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 117. maddesi

SONUÇ VE TALEP: Davalıdan [Borç Miktarı] TL'nin ödenmesini ve temerrüt faizi ile birlikte tahsilini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Borç Miktarı', 'Borçlanma Tarihi', 'Ödeme Tarihi'],
    legalBasis: ['TBK 117', 'TBK 118'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.4
  },
  // BORÇLAR HUKUKU - TAZMİNAT
  {
    id: 'maddi-tazminat',
    title: 'Maddi Tazminat Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Tazminat',
    description: 'Maddi zarar nedeniyle tazminat talebi',
    keywords: ['tazminat', 'zarar', 'maddi', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Maddi tazminat davası

AÇIKLAMALAR:

1. Davalının [Olay Tarihi] tarihinde gerçekleştirdiği [Olay Detayları] nedeniyle davacı maddi zarara uğramıştır.

2. Zararın miktarı [Zarar Miktarı] TL olarak hesaplanmıştır.

3. Davalının kusurlu davranışı ile zarar arasında nedensellik bağı bulunmaktadır.

4. Davacı, zararını belgelemek için gerekli delilleri sunmuştur.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 49. maddesi

SONUÇ VE TALEP: Davalıdan [Zarar Miktarı] TL maddi tazminat ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Zarar Miktarı', 'Olay Tarihi', 'Olay Detayları'],
    legalBasis: ['TBK 49', 'TBK 50'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  {
    id: 'maddi-ve-manevi-tazminat',
    title: 'Maddi ve Manevi Tazminat Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Tazminat',
    description: 'Hem maddi hem manevi zarar nedeniyle tazminat talebi',
    keywords: ['tazminat', 'zarar', 'maddi', 'manevi'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Maddi ve manevi tazminat davası

AÇIKLAMALAR:

1. Davalının [Olay Tarihi] tarihinde gerçekleştirdiği [Olay Detayları] nedeniyle davacı hem maddi hem manevi zarara uğramıştır.

2. Maddi zararın miktarı [Maddi Zarar Miktarı] TL olarak hesaplanmıştır.

3. Manevi zarar nedeniyle [Manevi Zarar Miktarı] TL tazminat talep edilmektedir.

4. Davalının kusurlu davranışı ile zarar arasında nedensellik bağı bulunmaktadır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 49. ve 58. maddeleri

SONUÇ VE TALEP: Davalıdan [Maddi Zarar Miktarı] TL maddi tazminat ve [Manevi Zarar Miktarı] TL manevi tazminat ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Maddi Zarar Miktarı', 'Manevi Zarar Miktarı', 'Olay Tarihi', 'Olay Detayları'],
    legalBasis: ['TBK 49', 'TBK 50', 'TBK 58'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },
  {
    id: 'trafik-kazasi-nedeniyle-maddi-tazminat',
    title: 'Trafik Kazası Nedeniyle Maddi Tazminat Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Tazminat',
    description: 'Trafik kazası nedeniyle maddi tazminat talebi',
    keywords: ['trafik', 'kaza', 'tazminat', 'araç'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Trafik kazası nedeniyle maddi tazminat davası

AÇIKLAMALAR:

1. [Kaza Tarihi] tarihinde [Kaza Yeri] mevkiinde trafik kazası meydana gelmiştir.

2. Kazada davacının [Araç Bilgileri] plakalı aracı hasar görmüştür.

3. Kazanın nedeni davalının kusurlu davranışıdır.

4. Davacının zararı [Zarar Miktarı] TL olarak hesaplanmıştır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 49. maddesi

SONUÇ VE TALEP: Davalıdan [Zarar Miktarı] TL maddi tazminat ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Kaza Tarihi', 'Kaza Yeri', 'Araç Bilgileri', 'Zarar Miktarı'],
    legalBasis: ['TBK 49', 'TBK 50'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  // MEDENİ HUKUK - TAPU
  {
    id: 'tapu-iptali',
    title: 'Tapu İptali Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Tapu',
    description: 'Tapu kaydının iptali talebi',
    keywords: ['tapu', 'iptal', 'gayrimenkul', 'kayıt'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Tapu iptali davası

AÇIKLAMALAR:

1. [Gayrimenkul Bilgileri] adlı gayrimenkulün tapusu davalı adına kayıtlıdır.

2. Bu tapu kaydı [İptal Nedeni] nedeniyle hatalıdır.

3. Tapu kaydının iptal edilmesi gerekmektedir.

4. Davacının mülkiyet hakkı ihlal edilmiştir.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 705. maddesi

SONUÇ VE TALEP: Tapu kaydının iptal edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Gayrimenkul Bilgileri', 'İptal Nedeni'],
    legalBasis: ['TMK 705', 'TMK 706'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  {
    id: 'tapu-tescil',
    title: 'Tapu Tescil Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Tapu',
    description: 'Tapu tescil talebi',
    keywords: ['tapu', 'tescil', 'gayrimenkul', 'kayıt'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Tapu tescil davası

AÇIKLAMALAR:

1. [Gayrimenkul Bilgileri] adlı gayrimenkulün mülkiyeti davacıya aittir.

2. Bu gayrimenkulün tapuya tescil edilmesi gerekmektedir.

3. Davalı, tapu tescilini engellemektedir.

4. Mülkiyet hakkının korunması için tescil şarttır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 705. maddesi

SONUÇ VE TALEP: Tapu tescilinin yapılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Gayrimenkul Bilgileri'],
    legalBasis: ['TMK 705', 'TMK 706'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },
  // MEDENİ HUKUK - KİRA
  {
    id: 'kira-artirimi',
    title: 'Kira Artırımı Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Kira',
    description: 'Kira bedelinin artırılması talebi',
    keywords: ['kira', 'artırım', 'bedel', 'gayrimenkul'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Kira artırımı davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Kira Sözleşmesi Tarihi] tarihinde kira sözleşmesi yapılmıştır.

2. Mevcut kira bedeli [Mevcut Kira Bedeli] TL'dir.

3. [Artırım Nedeni] nedeniyle kira bedelinin artırılması gerekmektedir.

4. Piyasa koşulları değişmiştir.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 344. maddesi

SONUÇ VE TALEP: Kira bedelinin artırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Kira Sözleşmesi Tarihi', 'Mevcut Kira Bedeli', 'Artırım Nedeni'],
    legalBasis: ['TBK 344', 'TBK 345'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'kira-feshi',
    title: 'Kira Feshi Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Kira',
    description: 'Kira sözleşmesinin feshi talebi',
    keywords: ['kira', 'fesih', 'sözleşme', 'gayrimenkul'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Kira feshi davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Kira Sözleşmesi Tarihi] tarihinde kira sözleşmesi yapılmıştır.

2. [Fesih Nedeni] nedeniyle kira sözleşmesinin feshi gerekmektedir.

3. Davalı, sözleşme şartlarına uymamaktadır.

4. Sözleşmenin devamı mümkün değildir.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 331. maddesi

SONUÇ VE TALEP: Kira sözleşmesinin feshini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Kira Sözleşmesi Tarihi', 'Fesih Nedeni'],
    legalBasis: ['TBK 331', 'TBK 332'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  // İŞ HUKUKU - İŞÇİ
  {
    id: 'isci-tazminati',
    title: 'İşçi Tazminatı Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'İşçi',
    description: 'İşçi tazminatı talebi',
    keywords: ['işçi', 'tazminat', 'iş', 'çalışan'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: İşçi tazminatı davası

AÇIKLAMALAR:

1. Davacı, davalının işyerinde [İşe Başlama Tarihi] tarihinden itibaren çalışmıştır.

2. [İşten Çıkış Tarihi] tarihinde işten çıkarılmıştır.

3. [Tazminat Nedeni] nedeniyle tazminat hakkı doğmuştur.

4. İşveren, tazminat ödememiştir.

HUKUKİ DAYANAK: İş Kanunu'nun 17. maddesi

SONUÇ VE TALEP: İşçi tazminatının ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'İşe Başlama Tarihi', 'İşten Çıkış Tarihi', 'Tazminat Nedeni'],
    legalBasis: ['İK 17', 'İK 18'],
    courtType: 'İş Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  },
  {
    id: 'isci-gerialma',
    title: 'İşçi Geri Alma Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'İşçi',
    description: 'İşçinin geri alınması talebi',
    keywords: ['işçi', 'geri alma', 'iş', 'çalışan'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: İşçi geri alma davası

AÇIKLAMALAR:

1. Davacı, davalının işyerinde [İşe Başlama Tarihi] tarihinden itibaren çalışmıştır.

2. [İşten Çıkış Tarihi] tarihinde haksız yere işten çıkarılmıştır.

3. [Geri Alma Nedeni] nedeniyle işe geri alınması gerekmektedir.

4. İşveren, haksız fesih yapmıştır.

HUKUKİ DAYANAK: İş Kanunu'nun 20. maddesi

SONUÇ VE TALEP: İşe geri alınmamı talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'İşe Başlama Tarihi', 'İşten Çıkış Tarihi', 'Geri Alma Nedeni'],
    legalBasis: ['İK 20', 'İK 21'],
    courtType: 'İş Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  // İŞ HUKUKU - İŞVEREN
  {
    id: 'isveren-tazminati',
    title: 'İşveren Tazminatı Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'İşveren',
    description: 'İşveren tazminatı talebi',
    keywords: ['işveren', 'tazminat', 'iş', 'zarar'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: İşveren tazminatı davası

AÇIKLAMALAR:

1. Davalı, davacının işyerinde [İşe Başlama Tarihi] tarihinden itibaren çalışmıştır.

2. [İşten Çıkış Tarihi] tarihinde işten ayrılmıştır.

3. [Tazminat Nedeni] nedeniyle işverene zarar vermiştir.

4. Bu zararın tazmin edilmesi gerekmektedir.

HUKUKİ DAYANAK: İş Kanunu'nun 25. maddesi

SONUÇ VE TALEP: İşveren tazminatının ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'İşe Başlama Tarihi', 'İşten Çıkış Tarihi', 'Tazminat Nedeni'],
    legalBasis: ['İK 25', 'İK 26'],
    courtType: 'İş Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.9
  },
  // TİCARET HUKUKU - ŞİRKET
  {
    id: 'sirket-kurulus',
    title: 'Şirket Kuruluş Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Şirket kuruluş talebi',
    keywords: ['şirket', 'kuruluş', 'ticaret', 'ortaklık'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Şirket kuruluş davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Sözleşme Tarihi] tarihinde şirket kuruluş sözleşmesi yapılmıştır.

2. [Şirket Türü] türünde şirket kurulması planlanmıştır.

3. [Kuruluş Nedeni] nedeniyle şirket kuruluşu gerçekleştirilememiştir.

4. Şirket kuruluşunun tamamlanması gerekmektedir.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 332. maddesi

SONUÇ VE TALEP: Şirket kuruluşunun tamamlanmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Sözleşme Tarihi', 'Şirket Türü', 'Kuruluş Nedeni'],
    legalBasis: ['TTK 332', 'TTK 333'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  {
    id: 'sirket-feshi',
    title: 'Şirket Feshi Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Şirket feshi talebi',
    keywords: ['şirket', 'fesih', 'ticaret', 'ortaklık'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Şirket feshi davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [Sözleşme Tarihi] tarihinde şirket kuruluş sözleşmesi yapılmıştır.

2. [Şirket Türü] türünde şirket kurulmuştur.

3. [Fesih Nedeni] nedeniyle şirketin feshi gerekmektedir.

4. Şirketin devamı mümkün değildir.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 580. maddesi

SONUÇ VE TALEP: Şirketin feshini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Sözleşme Tarihi', 'Şirket Türü', 'Fesih Nedeni'],
    legalBasis: ['TTK 580', 'TTK 581'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.8
  },
  // TİCARET HUKUKU - ÇEK
  {
    id: 'cek-protestosu',
    title: 'Çek Protestosu Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Çek',
    description: 'Çek protestosu talebi',
    keywords: ['çek', 'protesto', 'ticaret', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Çek protestosu davası

AÇIKLAMALAR:

1. Davalı, davacıya [Çek Tarihi] tarihinde [Çek Tutarı] TL tutarında çek vermiştir.

2. Çek, [Vade Tarihi] tarihinde vadesi gelmiştir.

3. Çek, ödeme için ibraz edildiğinde ödenmemiştir.

4. Çek protestosu yapılması gerekmektedir.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 680. maddesi

SONUÇ VE TALEP: Çek protestosunun yapılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çek Tarihi', 'Çek Tutarı', 'Vade Tarihi'],
    legalBasis: ['TTK 680', 'TTK 681'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'cek-tazminati',
    title: 'Çek Tazminatı Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Çek',
    description: 'Çek tazminatı talebi',
    keywords: ['çek', 'tazminat', 'ticaret', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Çek tazminatı davası

AÇIKLAMALAR:

1. Davalı, davacıya [Çek Tarihi] tarihinde [Çek Tutarı] TL tutarında çek vermiştir.

2. Çek, [Vade Tarihi] tarihinde vadesi gelmiştir.

3. Çek, ödeme için ibraz edildiğinde ödenmemiştir.

4. Bu durum nedeniyle tazminat hakkı doğmuştur.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 680. maddesi

SONUÇ VE TALEP: Çek tazminatının ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Çek Tarihi', 'Çek Tutarı', 'Vade Tarihi'],
    legalBasis: ['TTK 680', 'TTK 681'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  // TİCARET HUKUKU - SENET
  {
    id: 'senet-protestosu',
    title: 'Senet Protestosu Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Senet',
    description: 'Senet protestosu talebi',
    keywords: ['senet', 'protesto', 'ticaret', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Senet protestosu davası

AÇIKLAMALAR:

1. Davalı, davacıya [Senet Tarihi] tarihinde [Senet Tutarı] TL tutarında senet vermiştir.

2. Senet, [Vade Tarihi] tarihinde vadesi gelmiştir.

3. Senet, ödeme için ibraz edildiğinde ödenmemiştir.

4. Senet protestosu yapılması gerekmektedir.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 680. maddesi

SONUÇ VE TALEP: Senet protestosunun yapılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Senet Tarihi', 'Senet Tutarı', 'Vade Tarihi'],
    legalBasis: ['TTK 680', 'TTK 681'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '60-90 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'senet-tazminati',
    title: 'Senet Tazminatı Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Senet',
    description: 'Senet tazminatı talebi',
    keywords: ['senet', 'tazminat', 'ticaret', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Senet tazminatı davası

AÇIKLAMALAR:

1. Davalı, davacıya [Senet Tarihi] tarihinde [Senet Tutarı] TL tutarında senet vermiştir.

2. Senet, [Vade Tarihi] tarihinde vadesi gelmiştir.

3. Senet, ödeme için ibraz edildiğinde ödenmemiştir.

4. Bu durum nedeniyle tazminat hakkı doğmuştur.

HUKUKİ DAYANAK: Türk Ticaret Kanunu'nun 680. maddesi

SONUÇ VE TALEP: Senet tazminatının ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Senet Tarihi', 'Senet Tutarı', 'Vade Tarihi'],
    legalBasis: ['TTK 680', 'TTK 681'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  // CEZA HUKUKU - SUÇ
  {
    id: 'suclama',
    title: 'Suçlama Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Suç',
    description: 'Suçlama talebi',
    keywords: ['suç', 'suçlama', 'ceza', 'şikayet'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Suçlama davası

AÇIKLAMALAR:

1. Davalı, [Suç Tarihi] tarihinde [Suç Yeri]'nde [Suç Türü] suçunu işlemiştir.

2. Bu suç nedeniyle davacıya zarar vermiştir.

3. [Suç Delilleri] delilleri mevcuttur.

4. Suçlama yapılması gerekmektedir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 2. maddesi

SONUÇ VE TALEP: Suçlamanın yapılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Suç Tarihi', 'Suç Yeri', 'Suç Türü', 'Suç Delilleri'],
    legalBasis: ['TCK 2', 'TCK 3'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.9
  },
  {
    id: 'suclama-iptali',
    title: 'Suçlama İptali Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Suç',
    description: 'Suçlama iptali talebi',
    keywords: ['suç', 'iptal', 'ceza', 'şikayet'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Suçlama iptali davası

AÇIKLAMALAR:

1. Davalı hakkında [Suçlama Tarihi] tarihinde suçlama yapılmıştır.

2. Bu suçlama [İptal Nedeni] nedeniyle hatalıdır.

3. Suçlama delilleri yetersizdir.

4. Suçlamanın iptal edilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 2. maddesi

SONUÇ VE TALEP: Suçlamanın iptal edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Suçlama Tarihi', 'İptal Nedeni'],
    legalBasis: ['TCK 2', 'TCK 3'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.8
  },
  // CEZA HUKUKU - TAZMİNAT
  {
    id: 'ceza-tazminati',
    title: 'Ceza Tazminatı Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Tazminat',
    description: 'Ceza tazminatı talebi',
    keywords: ['ceza', 'tazminat', 'zarar', 'suç'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Ceza tazminatı davası

AÇIKLAMALAR:

1. Davalı, [Suç Tarihi] tarihinde [Suç Yeri]'nde [Suç Türü] suçunu işlemiştir.

2. Bu suç nedeniyle davacıya [Zarar Miktarı] TL zarar vermiştir.

3. [Zarar Delilleri] delilleri mevcuttur.

4. Zararın tazmin edilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 53. maddesi

SONUÇ VE TALEP: Ceza tazminatının ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Suç Tarihi', 'Suç Yeri', 'Suç Türü', 'Zarar Miktarı', 'Zarar Delilleri'],
    legalBasis: ['TCK 53', 'TCK 54'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.0
  },
  {
    id: 'ceza-tazminati-artirimi',
    title: 'Ceza Tazminatı Artırımı Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Tazminat',
    description: 'Ceza tazminatı artırımı talebi',
    keywords: ['ceza', 'tazminat', 'artırım', 'zarar'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Ceza tazminatı artırımı davası

AÇIKLAMALAR:

1. Davalı, [Suç Tarihi] tarihinde [Suç Yeri]'nde [Suç Türü] suçunu işlemiştir.

2. Bu suç nedeniyle davacıya [Mevcut Tazminat] TL tazminat ödenmiştir.

3. [Artırım Nedeni] nedeniyle tazminatın artırılması gerekmektedir.

4. Mevcut tazminat yetersizdir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 53. maddesi

SONUÇ VE TALEP: Ceza tazminatının artırılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Suç Tarihi', 'Suç Yeri', 'Suç Türü', 'Mevcut Tazminat', 'Artırım Nedeni'],
    legalBasis: ['TCK 53', 'TCK 54'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.9
  },
  // CEZA HUKUKU - ŞİKAYET
  {
    id: 'sikayet',
    title: 'Şikayet Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Şikayet',
    description: 'Şikayet talebi',
    keywords: ['şikayet', 'suç', 'ceza', 'ihbar'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Şikayet davası

AÇIKLAMALAR:

1. Davalı, [Suç Tarihi] tarihinde [Suç Yeri]'nde [Suç Türü] suçunu işlemiştir.

2. Bu suç nedeniyle davacıya zarar vermiştir.

3. [Şikayet Delilleri] delilleri mevcuttur.

4. Şikayet yapılması gerekmektedir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 2. maddesi

SONUÇ VE TALEP: Şikayetin yapılmasını talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Suç Tarihi', 'Suç Yeri', 'Suç Türü', 'Şikayet Delilleri'],
    legalBasis: ['TCK 2', 'TCK 3'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.1
  },
  {
    id: 'sikayet-iptali',
    title: 'Şikayet İptali Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Şikayet',
    description: 'Şikayet iptali talebi',
    keywords: ['şikayet', 'iptal', 'ceza', 'suç'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Davacı Ad Soyad]
DAVALI: [Davalı Ad Soyad]

KONU: Şikayet iptali davası

AÇIKLAMALAR:

1. Davalı hakkında [Şikayet Tarihi] tarihinde şikayet yapılmıştır.

2. Bu şikayet [İptal Nedeni] nedeniyle hatalıdır.

3. Şikayet delilleri yetersizdir.

4. Şikayetin iptal edilmesi gerekmektedir.

HUKUKİ DAYANAK: Türk Ceza Kanunu'nun 2. maddesi

SONUÇ VE TALEP: Şikayetin iptal edilmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Şikayet Tarihi', 'İptal Nedeni'],
    legalBasis: ['TCK 2', 'TCK 3'],
    courtType: 'Asliye Ceza Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 3.9
  }
];

export const getPetitionsByCategory = (category: string): PetitionTemplate[] => {
  return petitionTemplates.filter(petition => petition.category === category);
};

export const getPetitionsBySubcategory = (category: string, subcategory: string): PetitionTemplate[] => {
  return petitionTemplates.filter(petition => 
    petition.category === category && petition.subcategory === subcategory
  );
};

export const searchPetitions = (query: string): PetitionTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return petitionTemplates.filter(petition => 
    petition.title.toLowerCase().includes(lowercaseQuery) ||
    petition.description.toLowerCase().includes(lowercaseQuery) ||
    petition.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};

export const getPetitionById = (id: string): PetitionTemplate | undefined => {
  return petitionTemplates.find(petition => petition.id === id);
};

export const getPopularPetitions = (): PetitionTemplate[] => {
  return petitionTemplates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
};

export const getRecentPetitions = (): PetitionTemplate[] => {
  return petitionTemplates
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 10);
};
