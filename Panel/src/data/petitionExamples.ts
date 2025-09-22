// Dilekçe ve Sözleşme Örnekleri Veritabanı
// Production için temizlenmiş versiyon
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
export const allRealPetitionsConverted = realPetitions.map(convertRealToPetitionExample);

// Birleştirilmiş örnek veritabanı (Template + Gerçek)
export const combinedPetitionDatabase = [...allPetitionExamples, ...allRealPetitionsConverted];

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
  let matches = allRealPetitionsConverted.filter(p =>
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