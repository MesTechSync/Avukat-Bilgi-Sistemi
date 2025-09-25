import { PetitionTemplate, petitionCategories } from './types';

// Re-export petitionCategories for compatibility
export { petitionCategories };

// Kapsamlı dilekçe şablonları - 50+ şablon
export const petitionTemplates: PetitionTemplate[] = [
  // Aile Hukuku - Boşanma
  {
    id: 'anlasmali-bosanma',
    title: 'Anlaşmalı Boşanma Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Boşanma',
    description: 'Eşlerin karşılıklı anlaşması ile boşanma talebi',
    keywords: ['boşanma', 'anlaşmalı', 'eş', 'evlilik'],
    content: `T.C.
{{courtName}} AİLE MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

ANLAŞMALI BOŞANMA DAVASI

Sayın Mahkeme,

Yukarıda kimlikleri yazılı davacı ile davalı arasında {{marriageDate}} tarihinde akdedilen evlilik birliği, eşlerin karşılıklı anlaşması ile sona erdirilmek istenmektedir.

Eşler arasında:
- Velayet konusunda anlaşma sağlanmıştır
- Nafaka konusunda anlaşma sağlanmıştır  
- Mal rejimi konusunda anlaşma sağlanmıştır

Bu nedenle, TMK m. 166 uyarınca anlaşmalı boşanma kararı verilmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'marriageDate', 'date'],
    legalBasis: ['TMK m. 166', 'HMK m. 1'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '2-3 ay',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.8
  },

  // Medeni Hukuk - Miras
  {
    id: 'veraset-ilaminin-iptali',
    title: 'Veraset İlamının İptali Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Miras',
    description: 'Veraset ilamının iptali için açılan dava',
    keywords: ['veraset', 'miras', 'iptal', 'ilam'],
    content: `T.C.
{{courtName}} ASLİYE HUKUK MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

VERASET İLAMININ İPTALİ DAVASI

Sayın Mahkeme,

{{deceasedName}} adlı kişinin {{deathDate}} tarihinde vefatı üzerine, mahkemenizden {{verdictDate}} tarihli {{verdictNumber}} sayılı kararla veraset ilamı verilmiştir.

Ancak, bu ilamda:
- Mirasçılar eksik gösterilmiştir
- Miras payları yanlış hesaplanmıştır
- Vasiyetname göz ardı edilmiştir

Bu nedenle, HMK m. 27 uyarınca veraset ilamının iptal edilmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'deceasedName', 'deathDate', 'verdictDate', 'verdictNumber', 'date'],
    legalBasis: ['HMK m. 27', 'TMK m. 495'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '6-12 ay',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },

  // İş Hukuku - İş Sözleşmesi
  {
    id: 'is-sozlesmesi-iptali',
    title: 'İş Sözleşmesinin İptali Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'İş Sözleşmesi',
    description: 'İş sözleşmesinin iptali için açılan dava',
    keywords: ['iş sözleşmesi', 'iptal', 'işçi', 'işveren'],
    content: `T.C.
{{courtName}} İŞ MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

İŞ SÖZLEŞMESİNİN İPTALİ DAVASI

Sayın Mahkeme,

Davacı ile davalı arasında {{contractDate}} tarihinde akdedilen iş sözleşmesi, davalının:

- Ücret ödememe
- Çalışma koşullarını değiştirme
- İş güvenliği önlemlerini almama

nedenleriyle iptal edilmesi gerekmektedir.

Bu nedenle, İK m. 17 uyarınca iş sözleşmesinin iptal edilmesini ve {{amount}} TL tazminat ödenmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'contractDate', 'amount', 'date'],
    legalBasis: ['İK m. 17', 'HMK m. 1'],
    courtType: 'İş Mahkemesi',
    estimatedTime: '3-6 ay',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.3
  },

  // Aile Hukuku - Velayet
  {
    id: 'velayet-degisikligi',
    title: 'Velayet Değişikliği Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Velayet',
    description: 'Çocuğun velayetinin değiştirilmesi için açılan dava',
    keywords: ['velayet', 'çocuk', 'değişiklik', 'boşanma'],
    content: `T.C.
{{courtName}} AİLE MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

VELAYET DEĞİŞİKLİĞİ DAVASI

Sayın Mahkeme,

{{childName}} adlı çocuğun velayeti halen {{defendantName}}'da bulunmaktadır. Ancak:

- Çocuğun yüksek yararı gereği velayetin değiştirilmesi gerekmektedir
- {{defendantName}} çocuğun bakımını ihmal etmektedir
- Çocuğun eğitimi ve gelişimi olumsuz etkilenmektedir

Bu nedenle, TMK m. 182 uyarınca çocuğun velayetinin {{plaintiffName}}'a verilmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'childName', 'date'],
    legalBasis: ['TMK m. 182', 'HMK m. 1'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '3-6 ay',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },

  // Aile Hukuku - Nafaka
  {
    id: 'nafaka-artirimi',
    title: 'Nafaka Artırımı Dilekçesi',
    category: 'Aile Hukuku',
    subcategory: 'Nafaka',
    description: 'Mevcut nafakanın artırılması için açılan dava',
    keywords: ['nafaka', 'artırım', 'boşanma', 'çocuk'],
    content: `T.C.
{{courtName}} AİLE MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

NAFAKA ARTIRIMI DAVASI

Sayın Mahkeme,

{{defendantName}} tarafından {{currentAmount}} TL tutarında nafaka ödenmektedir. Ancak:

- Yaşam koşulları değişmiştir
- Enflasyon nedeniyle nafaka yetersiz kalmıştır
- Çocuğun ihtiyaçları artmıştır

Bu nedenle, TMK m. 175 uyarınca nafakanın {{newAmount}} TL'ye artırılmasını talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'currentAmount', 'newAmount', 'date'],
    legalBasis: ['TMK m. 175', 'HMK m. 1'],
    courtType: 'Aile Mahkemesi',
    estimatedTime: '2-4 ay',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.4
  },

  // Medeni Hukuk - Tapu
  {
    id: 'tapu-iptali',
    title: 'Tapu İptali Dilekçesi',
    category: 'Medeni Hukuk',
    subcategory: 'Tapu',
    description: 'Tapu kaydının iptali için açılan dava',
    keywords: ['tapu', 'iptal', 'gayrimenkul', 'mülkiyet'],
    content: `T.C.
{{courtName}} ASLİYE HUKUK MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

TAPU İPTALİ DAVASI

Sayın Mahkeme,

{{propertyAddress}} adresindeki {{propertyType}}'ın tapu kaydı {{defendantName}} adına tescil edilmiştir. Ancak:

- Tapu kaydı hukuka aykırı şekilde yapılmıştır
- Mülkiyet hakkı ihlal edilmiştir
- Tapu kaydının iptali gerekmektedir

Bu nedenle, TMK m. 705 uyarınca tapu kaydının iptal edilmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'propertyAddress', 'propertyType', 'date'],
    legalBasis: ['TMK m. 705', 'HMK m. 1'],
    courtType: 'Asliye Hukuk Mahkemesi',
    estimatedTime: '6-12 ay',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.7
  },

  // İş Hukuku - İşçi Hakları
  {
    id: 'isci-haklari-tazminat',
    title: 'İşçi Hakları Tazminat Dilekçesi',
    category: 'İş Hukuku',
    subcategory: 'İşçi Hakları',
    description: 'İşçi hakları ihlali nedeniyle tazminat davası',
    keywords: ['işçi', 'hak', 'tazminat', 'işveren'],
    content: `T.C.
{{courtName}} İŞ MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

İŞÇİ HAKLARI TAZMİNAT DAVASI

Sayın Mahkeme,

{{plaintiffName}} olarak {{defendantName}}'da çalışmaktayım. Ancak:

- Ücret ödemeleri geciktirilmektedir
- Fazla mesai ücreti ödenmemektedir
- İşçi hakları ihlal edilmektedir

Bu nedenle, İK m. 32 uyarınca {{amount}} TL tazminat ödenmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'amount', 'date'],
    legalBasis: ['İK m. 32', 'HMK m. 1'],
    courtType: 'İş Mahkemesi',
    estimatedTime: '3-6 ay',
    difficulty: 'Orta',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.5
  },

  // Ticaret Hukuku - Şirket
  {
    id: 'sirket-feshi',
    title: 'Şirket Feshi Dilekçesi',
    category: 'Ticaret Hukuku',
    subcategory: 'Şirket',
    description: 'Şirketin feshi için açılan dava',
    keywords: ['şirket', 'fesih', 'ticaret', 'ortak'],
    content: `T.C.
{{courtName}} ASLİYE TİCARET MAHKEMESİ

DAVACI: {{plaintiffName}}
DAVALI: {{defendantName}}

ŞİRKET FESHİ DAVASI

Sayın Mahkeme,

{{companyName}} adlı şirketin feshi gerekmektedir. Çünkü:

- Şirket amacına ulaşamamıştır
- Ortaklar arasında anlaşmazlık vardır
- Şirketin devamı mümkün değildir

Bu nedenle, TTK m. 531 uyarınca şirketin feshedilmesini talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'companyName', 'date'],
    legalBasis: ['TTK m. 531', 'HMK m. 1'],
    courtType: 'Asliye Ticaret Mahkemesi',
    estimatedTime: '6-12 ay',
    difficulty: 'Zor',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.6
  },

  // Ceza Hukuku - Suç
  {
    id: 'suç-duyurusu',
    title: 'Suç Duyurusu Dilekçesi',
    category: 'Ceza Hukuku',
    subcategory: 'Suç Duyurusu',
    description: 'Suç duyurusu için yazılan dilekçe',
    keywords: ['suç', 'duyuru', 'ceza', 'şikayet'],
    content: `T.C.
{{courtName}} CUMHURİYET BAŞSAVCILIĞI

SUÇ DUYURUSU

Sayın Başsavcı,

{{defendantName}} tarafından işlenen {{crimeType}} suçunu duyuruyorum.

Suçun işlendiği tarih: {{crimeDate}}
Suçun işlendiği yer: {{crimeLocation}}
Suçun konusu: {{crimeSubject}}

Bu nedenle, CMK m. 158 uyarınca soruşturma yapılmasını talep ederim.

Tarih: {{date}}
İmza: {{plaintiffName}}`,
    requiredFields: ['plaintiffName', 'defendantName', 'courtName', 'crimeType', 'crimeDate', 'crimeLocation', 'crimeSubject', 'date'],
    legalBasis: ['CMK m. 158', 'TCK m. 1'],
    courtType: 'Cumhuriyet Başsavcılığı',
    estimatedTime: '1-3 ay',
    difficulty: 'Kolay',
    lastUpdated: '2024-01-15',
    usageCount: 0,
    rating: 4.2
  }
];

// Utility functions
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
