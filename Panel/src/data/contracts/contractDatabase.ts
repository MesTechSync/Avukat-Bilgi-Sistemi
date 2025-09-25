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
  }
};

// Temel sözleşme şablonları - performans için sadece en önemli olanlar
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
