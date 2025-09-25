import { PetitionTemplate, petitionCategories } from './types';

// Temel dilekçe şablonları - performans için sadece en önemli olanlar
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
