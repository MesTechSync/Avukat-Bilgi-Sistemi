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
    'Boşanma': ['anlasmali-bosanma', 'haysiyetsizlik-nedeni-ile-bosanma', 'ayrilik-istemli'],
    'Velayet': ['cocukla-kisisel-iliskinin-yeniden-duzenlenmesi'],
    'Nafaka': ['nafaka-artirimi', 'istirak-nafakasi-arttirimi', 'tedbir-nafakasi'],
    'Evlilik': ['evliligin-butlani', 'evlenmenin-men-i', 'gaiplik-nedeni-ile-evliligin-feshi']
  },
  'Medeni Hukuk': {
    'Miras': ['veraset-ilaminin-iptali', 'veraset-ilaminin-duzeltilmesi', 'veraset-belgesi-verilmesi', 'mirasin-reddinin-tescili', 'olumun-tesbiti'],
    'Tapu': ['tapu-iptali-ve-tescil', 'kat-mulkiyetinin-devri', 'kat-irtifakinin-devri'],
    'Mülkiyet': ['ortak-yere-ayrilan-arsa-payinin-iptali', 'ortak-yere-yapilan-mudahalenin-onlenmesi', 'fuzuli-isgal']
  },
  'Borçlar Hukuku': {
    'Alacak': ['alacak-davasi', 'temerrut-nedeni-ile-alacak-davasi'],
    'Sözleşme': ['kira-bedelinin-attirilmasi', 'kiranin-yeni-kosullara-uyarlanmasi'],
    'Tazminat': ['maddi-tazminat', 'maddi-ve-manevi-tazminat', 'trafik-kazasi-nedeniyle-maddi-tazminat']
  },
  'İş Hukuku': {
    'İş Sözleşmesi': ['calisma-izni-talebi'],
    'İşçi Hakları': ['mazeret-dilekcesi']
  },
  'İcra ve İflas': {
    'İcra': ['cek-iptali', 'cek-odeme-yasagi', 'menfi-tesbit-ve-icra-takibinin-durdurulmasi'],
    'İflas': ['konkordatonun-feshi']
  },
  'Ceza Hukuku': {
    'Şikayet': ['savciliga-sikayet-dilekcesi'],
    'Koruma': ['ailenin-korunmasi-icin-tedbir', 'valilik-koruma-talebi']
  },
  'İdare Hukuku': {
    'Vergi': ['vergi-dairesi-uzlasma'],
    'Kamulaştırma': ['kamulastirilan-tasinmazin-iade-adina-tescili', 'kamulastirilma-bedelinin-arttilmasi']
  },
  'Ticaret Hukuku': {
    'Şirket': ['sirketin-feshi-dava'],
    'Rekabet': ['haksiz-rekabetin-onlenmesi']
  }
};

export const petitionTemplates: PetitionTemplate[] = [
  {
    id: 'anlasmali-bosanma',
    title: 'Anlaşmalı Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    description: 'Eşlerin karşılıklı rızaları ile boşanma talebi',
    keywords: ['boşanma', 'anlaşmalı', 'evlilik', 'ayrılık'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Ad Soyad]
DAVALI: [Ad Soyad]

KONU: Anlaşmalı boşanma davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [tarih] tarihinde evlilik akdi yapılmıştır.

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
    id: 'velayet-degisikligi',
    title: 'Velayet Değişikliği Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    description: 'Çocuğun velayetinin değiştirilmesi talebi',
    keywords: ['velayet', 'çocuk', 'değişiklik', 'aile'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Ad Soyad]
DAVALI: [Ad Soyad]

KONU: Velayet değişikliği davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [tarih] tarihinde boşanma gerçekleşmiş ve çocuğun velayeti davalıya verilmiştir.

2. Çocuğun yüksek yararı gözetilerek velayetin davacıya verilmesi gerekmektedir.

3. Davalının çocuğa bakım konusunda yetersiz kaldığı tespit edilmiştir.

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
    id: 'nafaka-artirimi',
    title: 'Nafaka Artırımı Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Mevcut nafaka miktarının artırılması talebi',
    keywords: ['nafaka', 'artırım', 'aile', 'destek'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Ad Soyad]
DAVALI: [Ad Soyad]

KONU: Nafaka artırımı davası

AÇIKLAMALAR:

1. Davacı ile davalı arasında [tarih] tarihinde boşanma gerçekleşmiş ve davalıya nafaka yükümlülüğü getirilmiştir.

2. Ekonomik koşulların değişmesi nedeniyle mevcut nafaka miktarı yetersiz kalmıştır.

3. Davacının yaşam standartları ve ihtiyaçları artmıştır.

HUKUKİ DAYANAK: Türk Medeni Kanunu'nun 175. maddesi

SONUÇ VE TALEP: Nafaka miktarının [miktar] TL'ye artırılmasını talep ederim.

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
    id: 'alacak-davasi',
    title: 'Alacak Davası Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Alacak',
    description: 'Borçluya karşı alacak talebi',
    keywords: ['alacak', 'borç', 'ödeme', 'tazminat'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Ad Soyad]
DAVALI: [Ad Soyad]

KONU: Alacak davası

AÇIKLAMALAR:

1. Davalı, davacıya [tarih] tarihinde [miktar] TL borçlanmıştır.

2. Borcun ödeme tarihi [tarih] olarak belirlenmiştir.

3. Davalı, belirlenen tarihte borcunu ödememiştir.

4. Davacı, alacağını talep etmesine rağmen davalı ödeme yapmamıştır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 125. maddesi

SONUÇ VE TALEP: Davalıdan [miktar] TL'nin ödenmesini ve gecikme faizi ile birlikte tahsilini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Borç Miktarı', 'Borçlanma Tarihi'],
    legalBasis: ['TBK 125', 'TBK 126'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '90-120 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },
  {
    id: 'maddi-tazminat',
    title: 'Maddi Tazminat Dilekçesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Tazminat',
    description: 'Maddi zarar nedeniyle tazminat talebi',
    keywords: ['tazminat', 'zarar', 'maddi', 'ödeme'],
    content: `MAHKEMESİNE

DAVA DİLEKÇESİ

DAVACI: [Ad Soyad]
DAVALI: [Ad Soyad]

KONU: Maddi tazminat davası

AÇIKLAMALAR:

1. Davalının [tarih] tarihinde gerçekleştirdiği [olay] nedeniyle davacı maddi zarara uğramıştır.

2. Zararın miktarı [miktar] TL olarak hesaplanmıştır.

3. Davalının kusurlu davranışı ile zarar arasında nedensellik bağı bulunmaktadır.

HUKUKİ DAYANAK: Türk Borçlar Kanunu'nun 49. maddesi

SONUÇ VE TALEP: Davalıdan [miktar] TL maddi tazminat ödenmesini talep ederim.

[İmza]`,
    requiredFields: ['Davacı Ad Soyad', 'Davalı Ad Soyad', 'Zarar Miktarı', 'Olay Tarihi'],
    legalBasis: ['TBK 49', 'TBK 50'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '120-180 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
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
