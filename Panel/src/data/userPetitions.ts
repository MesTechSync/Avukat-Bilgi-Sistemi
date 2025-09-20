// Bu dosyaya 70 dilekçe örneğini ekleyeceğiz
// Her dilekçe için aşağıdaki formatı kullan:

export const userPetitionExamples = [
  {
    id: 'user-001',
    title: 'BURAYA DİLEKÇE BAŞLIĞI',
    category: 'İş Hukuku', // veya 'Aile Hukuku', 'Trafik Kazası', 'Ticari Hukuk' vs.
    subcategory: 'İşten Çıkarma', // isteğe bağlı alt kategori
    keywords: ['anahtar', 'kelimeler', 'listesi'], // dilekçede geçen önemli terimler
    variables: ['DAVACI_ADI', 'DAVALI_ADI', 'TARIH'], // değiştirilecek alanlar {DAVACI_ADI} şeklinde
    content: `
BURAYA DİLEKÇE METNİ
Değişken alanları {BÜYÜK_HARFLE} yazın
Örnek: {DAVACI_ADI}, {DAVALI_ADI}, {TUTAR} vs.
`
  },
  
  // Sonraki dilekçeler için bu formatı kopyalayıp kullan...
  
];

// Bu dosyaya dilekçeleri ekledikten sonra petitionExamples.ts dosyasını güncelleyeceğiz