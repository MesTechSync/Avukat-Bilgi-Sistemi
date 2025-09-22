// Dilekçe ve Sözleşme Örnekleri Veritabanı
// 70+ gerçek örnek dilekçe ve sözleşme koleksiyonu
import { realPetitions, type RealPetition } from './realPetitions';

export interface PetitionExample {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  keywords: string[];
  variables: string[]; // İçerisindeki değişken alanlar
}

export interface ContractExample {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  keywords: string[];
  variables: string[];
}

// Demo veriler kaldırıldı - production için temizlendi
export const workLawPetitions: PetitionExample[] = [];
export const familyLawPetitions: PetitionExample[] = [];
export const contractExamples: ContractExample[] = [];
export const petitionExamples: PetitionExample[] = [];

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, { template: number; real: number; total: number }> = {};
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};
// Demo veriler kaldırıldı - production için temizlendi
export const workLawPetitions: PetitionExample[] = [];
export const familyLawPetitions: PetitionExample[] = [];
export const contractExamples: ContractExample[] = [];
export const petitionExamples: PetitionExample[] = [];

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, { template: number; real: number; total: number }> = {};
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};
// Demo veriler kaldırıldı - production için temizlendi
export const workLawPetitions: PetitionExample[] = [];
export const familyLawPetitions: PetitionExample[] = [];
export const contractExamples: ContractExample[] = [];
export const petitionExamples: PetitionExample[] = [];

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, { template: number; real: number; total: number }> = {};
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

// Tüm dilekçe örneklerini birleştir
export const allPetitionExamples = [...workLawPetitions, ...familyLawPetitions];
export const allRealPetitions = realPetitions;

// Kategori bazlı arama
export const searchPetitionsByCategory = (category: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => p.category === category);
};

// Anahtar kelime bazlı arama
export const searchPetitionsByKeyword = (keyword: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => 
    p.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
};

// Karma istatistikler
export const getCombinedCategoryStats = () => {
  const stats: Record<string, { template: number, real: number, total: number }> = {};
  
  allPetitionExamples.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].template++;
    stats[p.category].total++;
  });
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

// Demo veriler kaldırıldı - production için temizlendi
export const workLawPetitions: PetitionExample[] = [];
export const familyLawPetitions: PetitionExample[] = [];
export const contractExamples: ContractExample[] = [];
export const petitionExamples: PetitionExample[] = [];

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, { template: number; real: number; total: number }> = {};
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

// Tüm dilekçe örneklerini birleştir
export const allPetitionExamples = [...workLawPetitions, ...familyLawPetitions];
export const allRealPetitions = realPetitions;

// Kategori bazlı arama
export const searchPetitionsByCategory = (category: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => p.category === category);
};

// Anahtar kelime bazlı arama
export const searchPetitionsByKeyword = (keyword: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => 
    p.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
};

// Karma istatistikler
export const getCombinedCategoryStats = () => {
  const stats: Record<string, { template: number, real: number, total: number }> = {};
  
  allPetitionExamples.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].template++;
    stats[p.category].total++;
  });
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

// Demo veriler kaldırıldı - production için temizlendi
export const workLawPetitions: PetitionExample[] = [];
export const familyLawPetitions: PetitionExample[] = [];
export const contractExamples: ContractExample[] = [];
export const petitionExamples: PetitionExample[] = [];

// Kategori istatistikleri
export const getCategoryStats = () => {
  const stats: Record<string, { template: number; real: number; total: number }> = {};
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

// Tüm dilekçe örneklerini birleştir
export const allPetitionExamples = [...workLawPetitions, ...familyLawPetitions];
export const allRealPetitions = realPetitions;

// Kategori bazlı arama
export const searchPetitionsByCategory = (category: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => p.category === category);
};

// Anahtar kelime bazlı arama
export const searchPetitionsByKeyword = (keyword: string): PetitionExample[] => {
  return allPetitionExamples.filter(p => 
    p.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
  );
};

// Karma istatistikler
export const getCombinedCategoryStats = () => {
  const stats: Record<string, { template: number, real: number, total: number }> = {};
  
  allPetitionExamples.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].template++;
    stats[p.category].total++;
  });
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};

Evliliğimizin başlangıcında her şey yolunda iken, zamanla aramızda anlaşmazlıklar çıkmaya başlamıştır. Bu anlaşmazlıklar giderek artmış ve evlilik birliğinin temel amaçlarına ulaşılması imkansız hale gelmiştir.

Özellikle;
- Karşılıklı saygı ve sevginin ortadan kalktığı,
- Sürekli tartışma ve kavgaların yaşandığı,
- Ortak bir yaşam kurulamadığı,
- Uzlaşma çabalarının sonuçsuz kaldığı

gerekçeleriyle bu evliliğin devamının mümkün olmadığı anlaşılmıştır.

Bu nedenlerle Türk Medeni Kanunu'nun 166. maddesi gereğince geçimsizlik sebebiyle boşanmamıza karar verilmesini saygılarımla arz ederim.

{DATE}

{PLAINTIFF_NAME}
{SIGNATURE}`
  }
];

// Trafik Kazası Dilekçe Örnekleri  
export const trafficAccidentPetitions: PetitionExample[] = [
  {
    id: 'traffic-001',
    title: 'Trafik Kazası Tazminat Davası',
    category: 'Tazminat Hukuku',
    subcategory: 'Trafik Kazası',
    keywords: ['trafik kazası', 'maddi tazminat', 'manevi tazminat', 'araç hasarı'],
    variables: ['PLAINTIFF_NAME', 'DEFENDANT_NAME', 'ACCIDENT_DATE', 'ACCIDENT_LOCATION', 'DAMAGE_AMOUNT'],
    content: `ANKARA 3. ASLİYE HUKUK MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {PLAINTIFF_NAME}
T.C. Kimlik No: {PLAINTIFF_TC}
Adres: {PLAINTIFF_ADDRESS}

DAVALI: {DEFENDANT_NAME}
T.C. Kimlik No: {DEFENDANT_TC}  
Adres: {DEFENDANT_ADDRESS}

DAVA KONUSU: Trafik kazası nedeniyle maddi ve manevi tazminat

DAVA DEĞERİ: {TOTAL_DAMAGE_AMOUNT} TL

Sayın Hakim,

{ACCIDENT_DATE} tarihinde saat {ACCIDENT_TIME} sıralarında {ACCIDENT_LOCATION} mevkiinde davalının kullandığı {DEFENDANT_VEHICLE} plakalı araçla, benim kullandığım {PLAINTIFF_VEHICLE} plakalı araç arasında trafik kazası meydana gelmiştir.

Kaza, tamamen davalının kusurundan kaynaklanmıştır. Davalı;
- {FAULT_REASON_1}
- {FAULT_REASON_2}  
- {FAULT_REASON_3}

Bu kusurlu davranışları sonucunda kazaya sebebiyet vermiştir.

Bu kaza sonucunda;

MADDI ZARARLARIM:
1. Araç Hasarı: {VEHICLE_DAMAGE} TL
2. Ekspertiz Ücreti: {EXPERT_FEE} TL
3. Çekici Ücreti: {TOWING_FEE} TL
4. Tedavi Masrafları: {MEDICAL_EXPENSES} TL
5. İş Gücü Kaybı: {WORK_LOSS} TL

MANEVİ ZARARIM: {MORAL_DAMAGE} TL

TOPLAM ZARAR: {TOTAL_DAMAGE_AMOUNT} TL

Yukarıda belirtilen zararların davalıdan tahsilini saygılarımla talep ederim.

{DATE}

{PLAINTIFF_NAME}
{SIGNATURE}`
  }
];

// Tüm örnekleri birleştiren ana koleksiyon
export const allPetitionExamples = [
  ...workLawPetitions,
  ...familyLawPetitions,
  ...trafficAccidentPetitions
];

// Kategori bazında arama
export const getPetitionsByCategory = (category: string): PetitionExample[] => {
  return allPetitionExamples.filter(petition => 
    petition.category.toLowerCase().includes(category.toLowerCase())
  );
};

// Anahtar kelime bazında arama
export const searchPetitions = (keyword: string): PetitionExample[] => {
  return allPetitionExamples.filter(petition =>
    petition.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    petition.title.toLowerCase().includes(keyword.toLowerCase()) ||
    petition.content.toLowerCase().includes(keyword.toLowerCase())
  );
};

// ===== GERÇEK DİLEKÇE ÖRNEKLERİ ENTEGRASYONU =====

// Gerçek örnekleri PetitionExample formatına dönüştür
export const convertRealToPetitionExample = (real: RealPetition): PetitionExample => ({
  id: real.id,
  title: real.title,
  category: real.category,
  subcategory: real.subcategory,
  content: real.template,
  keywords: real.keywords,
  variables: real.variables
});

// Tüm gerçek örnekleri dahil et
export const allRealPetitions = realPetitions.map(convertRealToPetitionExample);

// Birleştirilmiş örnek veritabanı (Template + Gerçek)
export const combinedPetitionDatabase = [...allPetitionExamples, ...allRealPetitions];

// Kategori bazlı gelişmiş arama (Gerçek örnekler dahil)
export const searchCombinedByCategory = (category: string): PetitionExample[] => {
  return combinedPetitionDatabase.filter(p => p.category === category);
};

// Anahtar kelime ile gelişmiş arama (Gerçek örnekler dahil)
export const searchCombinedByKeyword = (keyword: string): PetitionExample[] => {
  return combinedPetitionDatabase.filter(p =>
    p.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    p.title.toLowerCase().includes(keyword.toLowerCase())
  );
};

// AI için en uygun örneği bul
export const findBestPetitionMatch = (userQuery: string): PetitionExample | null => {
  const query = userQuery.toLowerCase();
  
  // Önce gerçek örneklerden ara
  let matches = allRealPetitions.filter(p =>
    p.keywords.some(k => query.includes(k.toLowerCase())) ||
    query.includes(p.category.toLowerCase())
  );
  
  // Gerçek örnekte bulamazsa template'lerden ara
  if (matches.length === 0) {
    matches = allPetitionExamples.filter(p =>
      p.keywords.some(k => query.includes(k.toLowerCase()))
    );
  }
  
  // En çok eşleşen anahtar kelimeye sahip olanı döndür
  if (matches.length > 0) {
    return matches.reduce((best, current) => {
      const bestScore = best.keywords.filter(k => query.includes(k.toLowerCase())).length;
      const currentScore = current.keywords.filter(k => query.includes(k.toLowerCase())).length;
      return currentScore > bestScore ? current : best;
    });
  }
  
  return null;
};

// Kategori istatistikleri (Birleşik)
export const getCombinedCategoryStats = () => {
  const stats: Record<string, { template: number, real: number, total: number }> = {};
  
  allPetitionExamples.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].template++;
    stats[p.category].total++;
  });
  
  allRealPetitions.forEach(p => {
    if (!stats[p.category]) stats[p.category] = { template: 0, real: 0, total: 0 };
    stats[p.category].real++;
    stats[p.category].total++;
  });
  
  return stats;
};