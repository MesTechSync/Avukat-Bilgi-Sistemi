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

// İş Hukuku Dilekçe Örnekleri
export const workLawPetitions: PetitionExample[] = [
  {
    id: 'work-001',
    title: 'İşten Çıkarma Tazminatı Davası',
    category: 'İş Hukuku',
    subcategory: 'Tazminat',
    keywords: ['işten çıkarma', 'kıdem tazminatı', 'ihbar tazminatı', 'haksız fesih'],
    variables: ['EMPLOYEE_NAME', 'COMPANY_NAME', 'WORK_START_DATE', 'TERMINATION_DATE', 'POSITION', 'SALARY', 'SEVERANCE_AMOUNT'],
    content: `ANKARA 2. İŞ MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {EMPLOYEE_NAME}
T.C. Kimlik No: {TC_NO}
Adres: {EMPLOYEE_ADDRESS}
Telefon: {PHONE}

DAVALI: {COMPANY_NAME}
Adres: {COMPANY_ADDRESS}
Vergi No: {TAX_NO}

DAVA KONUSU: İşten çıkarma tazminatı, kıdem tazminatı, ihbar tazminatı ve diğer işçilik alacaklarının tahsili

DAVA DEĞERİ: {TOTAL_AMOUNT} TL

Sayın Hakim,

Ben {EMPLOYEE_NAME}, {WORK_START_DATE} tarihinde davalı {COMPANY_NAME} şirketinde {POSITION} pozisyonunda işe başlamış, {TERMINATION_DATE} tarihine kadar toplam {WORK_YEARS} yıl {WORK_MONTHS} ay çalışmış bulunmaktayım.

{TERMINATION_DATE} tarihinde herhangi bir haklı sebep gösterilmeksizin, İş Kanunu'nun 25. maddesine aykırı olarak işten çıkarılmış bulunmaktayım.

Çalışma dönemim boyunca aylık {SALARY} TL brüt maaş almaktaydım.

Bu durumda aşağıdaki alacaklarımın tahsilini talep etmekteyim:

1. Kıdem Tazminatı: {SEVERANCE_AMOUNT} TL
2. İhbar Tazminatı: {NOTICE_AMOUNT} TL  
3. Yıllık İzin Ücreti: {VACATION_AMOUNT} TL
4. Fazla Mesai Ücreti: {OVERTIME_AMOUNT} TL
5. Haksız Fesih Tazminatı: {WRONGFUL_TERMINATION_AMOUNT} TL

TOPLAM TALEP: {TOTAL_AMOUNT} TL

Yukarıda belirtilen tutarların davalı şirketten tahsili ile birlikte yargılama giderlerinin de davalıdan alınmasına karar verilmesini saygılarımla arz ederim.

{DATE}

{EMPLOYEE_NAME}
{SIGNATURE}`
  }
];

// Aile Hukuku Dilekçe Örnekleri
export const familyLawPetitions: PetitionExample[] = [
  {
    id: 'family-001',
    title: 'Boşanma Davası Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    keywords: ['boşanma', 'geçimsizlik', 'velayet', 'nafaka'],
    variables: ['PLAINTIFF_NAME', 'DEFENDANT_NAME', 'MARRIAGE_DATE', 'CHILDREN_COUNT', 'MARRIAGE_ADDRESS'],
    content: `ANKARA 1. AİLE MAHKEMESİ BAŞKANLIĞI'NA

DAVACI: {PLAINTIFF_NAME}
T.C. Kimlik No: {PLAINTIFF_TC}
Adres: {PLAINTIFF_ADDRESS}

DAVALI: {DEFENDANT_NAME}
T.C. Kimlik No: {DEFENDANT_TC}
Adres: {DEFENDANT_ADDRESS}

DAVA KONUSU: Geçimsizlik sebebiyle boşanma

Sayın Hakim,

Ben {PLAINTIFF_NAME}, davalı {DEFENDANT_NAME} ile {MARRIAGE_DATE} tarihinde {MARRIAGE_ADDRESS} adresinde evlendim.

Evliliğimizden {CHILDREN_COUNT} çocuğumuz dünyaya gelmiştir:
{CHILDREN_LIST}

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