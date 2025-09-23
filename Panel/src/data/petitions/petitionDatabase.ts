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
