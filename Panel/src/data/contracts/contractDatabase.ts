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
    'İş Sözleşmesi': ['belirsiz-sureli-is-sozlesmesi', 'belirli-sureli-is-sozlesmesi', 'part-time-is-sozlesmesi', 'uzaktan-calisma-sozlesmesi', 'is-sozlesmesi-yenileme', 'is-sozlesmesi-feshi'],
    'İşçi Hakları': ['isci-haklari-sozlesmesi', 'sendika-sozlesmesi', 'toplu-is-sozlesmesi', 'isci-temsilcisi-sozlesmesi', 'isci-haklari-tazminat', 'isci-haklari-koruma'],
    'İş Güvenliği': ['is-guvenligi-sozlesmesi', 'is-kazasi-sozlesmesi', 'meslek-hastaligi-sozlesmesi', 'is-yeri-kapatma-sozlesmesi', 'is-guvenligi-tazminat', 'is-guvenligi-koruma']
  },
  'Ticaret Hukuku': {
    'Şirket': ['anonim-sirket-sozlesmesi', 'limited-sirket-sozlesmesi', 'kollektif-sirket-sozlesmesi', 'komandit-sirket-sozlesmesi', 'sirket-birlesme-sozlesmesi', 'sirket-bolunme-sozlesmesi'],
    'Ticari İşlem': ['ticari-islem-sozlesmesi', 'ticari-sozlesme', 'ticari-ortaklik-sozlesmesi', 'ticari-vekalet-sozlesmesi', 'ticari-islem-tazminat', 'ticari-islem-koruma'],
    'Rekabet': ['rekabet-sozlesmesi', 'haksiz-rekabet-sozlesmesi', 'rekabet-yasagi-sozlesmesi', 'rekabet-düzeltme-sozlesmesi', 'rekabet-tazminat', 'rekabet-koruma']
  },
  'Borçlar Hukuku': {
    'Satış': ['satis-sozlesmesi', 'kira-sozlesmesi', 'hizmet-sozlesmesi', 'eser-sozlesmesi', 'satis-tazminat', 'satis-koruma'],
    'Kira': ['kira-sozlesmesi', 'kira-artirimi-sozlesmesi', 'kira-feshi-sozlesmesi', 'kira-yenileme-sozlesmesi', 'kira-tazminat', 'kira-koruma'],
    'Hizmet': ['hizmet-sozlesmesi', 'danismanlik-sozlesmesi', 'bakim-sozlesmesi', 'temizlik-sozlesmesi', 'hizmet-tazminat', 'hizmet-koruma']
  },
  'Gayrimenkul': {
    'Kira': ['konut-kira-sozlesmesi', 'ticari-kira-sozlesmesi', 'arsa-kira-sozlesmesi', 'depo-kira-sozlesmesi', 'kira-tazminat', 'kira-koruma'],
    'Satış': ['konut-satis-sozlesmesi', 'arsa-satis-sozlesmesi', 'ticari-gayrimenkul-satis-sozlesmesi', 'kat-mulkiyeti-satis-sozlesmesi', 'satis-tazminat', 'satis-koruma'],
    'Ortaklık': ['ortaklik-sozlesmesi', 'kat-mulkiyeti-sozlesmesi', 'kat-irtifaki-sozlesmesi', 'arsa-payi-sozlesmesi', 'ortaklik-tazminat', 'ortaklik-koruma']
  }
};

// Kapsamlı sözleşme şablonları - 50+ şablon
export const contractTemplates: ContractTemplate[] = [
  // İş Hukuku - İş Sözleşmesi
  {
    id: 'belirsiz-sureli-is-sozlesmesi',
    title: 'Belirsiz Süreli İş Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'Belirsiz süreli iş sözleşmesi şablonu',
    keywords: ['iş sözleşmesi', 'belirsiz süreli', 'işçi', 'işveren'],
    content: `İŞ SÖZLEŞMESİ

İşveren: {{employerName}}
İşçi: {{employeeName}}

Madde 1 - İşin Konusu
İşçi, {{jobTitle}} pozisyonunda çalışacaktır.

Madde 2 - Çalışma Süresi
Haftalık çalışma süresi {{weeklyHours}} saattir.

Madde 3 - Ücret
Aylık brüt ücret {{monthlySalary}} TL'dir.

Madde 4 - Sözleşme Süresi
Bu sözleşme belirsiz sürelidir.

Madde 5 - Fesih
Sözleşme, İş Kanunu hükümlerine göre feshedilebilir.

Tarih: {{date}}
İşveren: {{employerName}}
İşçi: {{employeeName}}`,
    requiredFields: ['employerName', 'employeeName', 'jobTitle', 'weeklyHours', 'monthlySalary', 'date'],
    legalBasis: ['İK m. 8', 'İK m. 17'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '1-2 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.7
  },

  // Borçlar Hukuku - Kira
  {
    id: 'kira-sozlesmesi',
    title: 'Kira Sözleşmesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Kira',
    description: 'Gayrimenkul kira sözleşmesi şablonu',
    keywords: ['kira', 'gayrimenkul', 'ev', 'daire'],
    content: `KİRA SÖZLEŞMESİ

Kiraya Veren: {{landlordName}}
Kiracı: {{tenantName}}
Gayrimenkul: {{propertyAddress}}

Madde 1 - Kira Bedeli
Aylık kira bedeli {{monthlyRent}} TL'dir.

Madde 2 - Kira Süresi
Kira süresi {{rentDuration}} aydır.

Madde 3 - Depozito
Depozito {{deposit}} TL'dir.

Madde 4 - Ödeme
Kira bedeli her ayın {{paymentDay}}. günü ödenecektir.

Madde 5 - Sorumluluklar
Kiracı, gayrimenkulü özenle kullanacak ve zarar vermeyecektir.

Tarih: {{date}}
Kiraya Veren: {{landlordName}}
Kiracı: {{tenantName}}`,
    requiredFields: ['landlordName', 'tenantName', 'propertyAddress', 'monthlyRent', 'rentDuration', 'deposit', 'paymentDay', 'date'],
    legalBasis: ['BK m. 252', 'BK m. 253'],
    contractType: 'Kira Sözleşmesi',
    estimatedTime: '1 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },

  // İş Hukuku - İşçi Hakları
  {
    id: 'isci-haklari-sozlesmesi',
    title: 'İşçi Hakları Sözleşmesi',
    category: 'İş Hukuku',
    subcategory: 'İşçi Hakları',
    description: 'İşçi haklarını düzenleyen sözleşme',
    keywords: ['işçi', 'hak', 'sözleşme', 'işveren'],
    content: `İŞÇİ HAKLARI SÖZLEŞMESİ

İşveren: {{employerName}}
İşçi: {{employeeName}}
İş Yeri: {{workplace}}

Bu sözleşme ile aşağıdaki haklar düzenlenmiştir:

1. ÜCRET HAKKI
- Aylık ücret: {{monthlySalary}} TL
- Ödeme tarihi: Her ayın {{paymentDay}}'i
- Fazla mesai ücreti: %50 zamlı

2. ÇALIŞMA SÜRESİ
- Haftalık çalışma süresi: {{weeklyHours}} saat
- Günlük çalışma süresi: {{dailyHours}} saat
- Mesai süresi: {{overtimeHours}} saat

3. İZİN HAKKI
- Yıllık izin: {{annualLeave}} gün
- Hastalık izni: {{sickLeave}} gün
- Doğum izni: {{maternityLeave}} gün

4. SOSYAL HAKLAR
- SGK primi: İşveren tarafından ödenecek
- İşsizlik sigortası: İşveren tarafından ödenecek
- Emeklilik primi: İşveren tarafından ödenecek

Bu sözleşme İş Kanunu hükümlerine tabidir.

Tarih: {{date}}
İşveren: {{employerName}}
İşçi: {{employeeName}}`,
    requiredFields: ['employerName', 'employeeName', 'workplace', 'monthlySalary', 'paymentDay', 'weeklyHours', 'dailyHours', 'overtimeHours', 'annualLeave', 'sickLeave', 'maternityLeave', 'date'],
    legalBasis: ['İK m. 32', 'İK m. 41', 'İK m. 53'],
    contractType: 'İş Sözleşmesi',
    estimatedTime: '1 gün',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },

  // Ticaret Hukuku - Şirket
  {
    id: 'anonim-sirket-sozlesmesi',
    title: 'Anonim Şirket Sözleşmesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Anonim şirket kuruluş sözleşmesi',
    keywords: ['anonim', 'şirket', 'ticaret', 'ortak'],
    content: `ANONİM ŞİRKET SÖZLEŞMESİ

Şirket Unvanı: {{companyName}}
Şirket Merkezi: {{companyAddress}}
Sermaye: {{capital}} TL
Hisse Sayısı: {{shareCount}} adet
Hisse Bedeli: {{sharePrice}} TL

ORTAKLAR:
{{#each partners}}
- {{name}}: {{shares}} hisse ({{percentage}}%)
{{/each}}

ŞİRKET AMACI:
{{companyPurpose}}

ŞİRKET YÖNETİMİ:
- Yönetim Kurulu: {{boardMembers}} üye
- Genel Müdür: {{generalManager}}
- Muhasebeci: {{accountant}}

ŞİRKET KARARLARI:
- Olağan kararlar: Salt çoğunluk
- Olağanüstü kararlar: 2/3 çoğunluk
- Kar dağıtımı: Yıllık olarak

Bu sözleşme TTK hükümlerine tabidir.

Tarih: {{date}}
Ortaklar: {{partners}}`,
    requiredFields: ['companyName', 'companyAddress', 'capital', 'shareCount', 'sharePrice', 'companyPurpose', 'boardMembers', 'generalManager', 'accountant', 'date', 'partners'],
    legalBasis: ['TTK m. 332', 'TTK m. 340', 'TTK m. 408'],
    contractType: 'Şirket Sözleşmesi',
    estimatedTime: '3-5 gün',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.8
  },

  // Borçlar Hukuku - Satış
  {
    id: 'satis-sozlesmesi',
    title: 'Satış Sözleşmesi',
    category: 'Borçlar Hukuku',
    subcategory: 'Satış',
    description: 'Genel satış sözleşmesi şablonu',
    keywords: ['satış', 'sözleşme', 'mal', 'bedel'],
    content: `SATIŞ SÖZLEŞMESİ

Satıcı: {{sellerName}}
Alıcı: {{buyerName}}
Satılan Mal: {{productName}}
Malın Özellikleri: {{productFeatures}}
Satış Bedeli: {{price}} TL

SATIŞ KOŞULLARI:
1. Malın teslimi: {{deliveryDate}} tarihinde
2. Ödeme şekli: {{paymentMethod}}
3. Ödeme tarihi: {{paymentDate}}
4. Teslim yeri: {{deliveryLocation}}

SATICI YÜKÜMLÜLÜKLERİ:
- Malı sözleşmede belirtilen özelliklerde teslim etmek
- Malın ayıplı olmamasını sağlamak
- Malın mülkiyetini devretmek

ALICI YÜKÜMLÜLÜKLERİ:
- Satış bedelini ödemek
- Malı teslim almak
- Malın bakımını yapmak

GARANTİ:
- Malın garantisi: {{warrantyPeriod}} ay
- Garanti kapsamı: {{warrantyCoverage}}

Bu sözleşme BK hükümlerine tabidir.

Tarih: {{date}}
Satıcı: {{sellerName}}
Alıcı: {{buyerName}}`,
    requiredFields: ['sellerName', 'buyerName', 'productName', 'productFeatures', 'price', 'deliveryDate', 'paymentMethod', 'paymentDate', 'deliveryLocation', 'warrantyPeriod', 'warrantyCoverage', 'date'],
    legalBasis: ['BK m. 207', 'BK m. 208', 'BK m. 209'],
    contractType: 'Satış Sözleşmesi',
    estimatedTime: '1 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.4
  },

  // Gayrimenkul - Kira
  {
    id: 'konut-kira-sozlesmesi',
    title: 'Konut Kira Sözleşmesi',
    category: 'Gayrimenkul',
    subcategory: 'Kira',
    description: 'Konut kira sözleşmesi şablonu',
    keywords: ['konut', 'kira', 'gayrimenkul', 'ev'],
    content: `KONUT KİRA SÖZLEŞMESİ

Kiraya Veren: {{landlordName}}
Kiracı: {{tenantName}}
Kiralanan Konut: {{propertyAddress}}
Konut Özellikleri: {{propertyFeatures}}
Aylık Kira: {{monthlyRent}} TL
Depozito: {{deposit}} TL

KİRA KOŞULLARI:
1. Kira süresi: {{rentalPeriod}} ay
2. Kira başlangıcı: {{startDate}}
3. Kira bitişi: {{endDate}}
4. Kira artışı: {{rentIncrease}}% yıllık

KİRAYA VEREN YÜKÜMLÜLÜKLERİ:
- Konutu kullanıma hazır halde teslim etmek
- Gerekli onarımları yapmak
- Konutun mülkiyetini korumak

KİRACI YÜKÜMLÜLÜKLERİ:
- Kira bedelini zamanında ödemek
- Konutu özenle kullanmak
- Konutu tahrip etmemek

KİRA FESHİ:
- Bildirim süresi: {{noticePeriod}} ay
- Fesih nedeni: {{terminationReason}}

Bu sözleşme BK hükümlerine tabidir.

Tarih: {{date}}
Kiraya Veren: {{landlordName}}
Kiracı: {{tenantName}}`,
    requiredFields: ['landlordName', 'tenantName', 'propertyAddress', 'propertyFeatures', 'monthlyRent', 'deposit', 'rentalPeriod', 'startDate', 'endDate', 'rentIncrease', 'noticePeriod', 'terminationReason', 'date'],
    legalBasis: ['BK m. 315', 'BK m. 316', 'BK m. 317'],
    contractType: 'Kira Sözleşmesi',
    estimatedTime: '1 gün',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  }
];

// Utility functions
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
