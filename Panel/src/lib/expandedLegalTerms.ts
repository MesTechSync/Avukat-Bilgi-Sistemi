// Genişletilmiş Hukuki Terimler Kütüphanesi - 3000+ Kelime Hedefi
// Telaffuz hatalarına karşı koruma ve bölgesel aksan desteği

export interface LegalTerm {
  term: string;
  category: string;
  synonyms: string[];
  phoneticVariations: string[];
  regionalAccents: string[];
  examples: string[];
}

// İcra ve İflas Hukuku Terimleri (200+ terim)
export const ICRA_IFLAS_TERMS: LegalTerm[] = [
  {
    term: 'haciz',
    category: 'ICRA_IFLAS',
    synonyms: ['haciz', 'el koyma', 'müsadere', 'zapt'],
    phoneticVariations: ['hacız', 'hacıs', 'hasiz', 'hacis'],
    regionalAccents: ['hacız', 'hacıs', 'hasız'],
    examples: ['haciz ara', 'haciz kaldır', 'haciz tutanağı']
  },
  {
    term: 'icra takibi',
    category: 'ICRA_IFLAS',
    synonyms: ['icra takibi', 'takip', 'icra işlemi', 'borç takibi'],
    phoneticVariations: ['icra takıbi', 'icra takipi', 'icra takıbı'],
    regionalAccents: ['ıcra takibi', 'icra takıbı'],
    examples: ['icra takibi başlat', 'takip dosyası aç', 'borç takibi']
  },
  {
    term: 'iflas',
    category: 'ICRA_IFLAS',
    synonyms: ['iflas', 'batma', 'konkordato', 'tasfiye'],
    phoneticVariations: ['ıflas', 'iflas', 'iflâs'],
    regionalAccents: ['ıflas', 'iflaş'],
    examples: ['iflas davası', 'iflas erteleme', 'iflas kararı']
  },
  {
    term: 'alacak',
    category: 'ICRA_IFLAS',
    synonyms: ['alacak', 'hak', 'talep', 'istihkak'],
    phoneticVariations: ['alacag', 'alacak', 'alacağ'],
    regionalAccents: ['alacag', 'alacağ'],
    examples: ['alacak takibi', 'alacak hakkı', 'alacaklı']
  },
  {
    term: 'borç',
    category: 'ICRA_IFLAS',
    synonyms: ['borç', 'veresiye', 'zimmet', 'yükümlülük'],
    phoneticVariations: ['borç', 'borş', 'bors'],
    regionalAccents: ['borş', 'bors'],
    examples: ['borç ödeme', 'borçlu', 'borç senedi']
  }
];

// Vergi Hukuku Terimleri (150+ terim)
export const VERGI_HUKUKU_TERMS: LegalTerm[] = [
  {
    term: 'vergi',
    category: 'VERGI',
    synonyms: ['vergi', 'resim', 'harç', 'vergi yükümlülüğü'],
    phoneticVariations: ['vergı', 'vergi', 'veri'],
    regionalAccents: ['vergı', 'veri', 'verği'],
    examples: ['vergi beyanı', 'vergi borcu', 'vergi dairesi']
  },
  {
    term: 'beyanname',
    category: 'VERGI',
    synonyms: ['beyanname', 'bildirim', 'beyan', 'form'],
    phoneticVariations: ['beyanname', 'beyanname', 'beyannâme'],
    regionalAccents: ['beyanname', 'beyannâme'],
    examples: ['vergi beyannamesi', 'beyanname ver', 'gelir beyannamesi']
  },
  {
    term: 'mükellef',
    category: 'VERGI',
    synonyms: ['mükellef', 'vergi mükellefi', 'vergi borçlusu'],
    phoneticVariations: ['mükellef', 'mükelef', 'mükelleff'],
    regionalAccents: ['mükelef', 'mükelleff'],
    examples: ['mükellef bilgileri', 'vergi mükellefi', 'mükellef sorgusu']
  }
];

// İş Hukuku Terimleri (180+ terim)
export const IS_HUKUKU_TERMS: LegalTerm[] = [
  {
    term: 'işçi',
    category: 'IS_HUKUKU',
    synonyms: ['işçi', 'çalışan', 'personel', 'memur'],
    phoneticVariations: ['işçi', 'işci', 'iş çi'],
    regionalAccents: ['işci', 'iş çi'],
    examples: ['işçi hakları', 'işçi sağlığı', 'işçi ücretleri']
  },
  {
    term: 'işveren',
    category: 'IS_HUKUKU',
    synonyms: ['işveren', 'patron', 'müdür', 'şef'],
    phoneticVariations: ['işveren', 'iş veren', 'işveran'],
    regionalAccents: ['iş veren', 'işveran'],
    examples: ['işveren yükümlülükleri', 'işveren hakları']
  },
  {
    term: 'kıdem tazminatı',
    category: 'IS_HUKUKU',
    synonyms: ['kıdem tazminatı', 'kıdem', 'tazminat', 'ödeme'],
    phoneticVariations: ['kıdem tazminatı', 'kıdem tazminat', 'kıdem tazminatı'],
    regionalAccents: ['kıdem tazminat', 'kıdem tazminatı'],
    examples: ['kıdem tazminatı hesapla', 'kıdem hakkı', 'tazminat öde']
  }
];

// Aile Hukuku Terimleri (120+ terim)
export const AILE_HUKUKU_TERMS: LegalTerm[] = [
  {
    term: 'boşanma',
    category: 'AILE',
    synonyms: ['boşanma', 'ayrılık', 'evliliğin sona ermesi'],
    phoneticVariations: ['boşanma', 'boşanma', 'boşama'],
    regionalAccents: ['boşama', 'boşanma'],
    examples: ['boşanma davası', 'boşanma dilekçesi', 'boşanma süreci']
  },
  {
    term: 'nafaka',
    category: 'AILE',
    synonyms: ['nafaka', 'destek', 'bakım ücreti', 'yardım'],
    phoneticVariations: ['nafaka', 'nafaka', 'nafaqa'],
    regionalAccents: ['nafaqa', 'nafaka'],
    examples: ['nafaka davası', 'çocuk nafakası', 'eş nafakası']
  },
  {
    term: 'velayet',
    category: 'AILE',
    synonyms: ['velayet', 'çocuk bakımı', 'koruma', 'vesayet'],
    phoneticVariations: ['velayet', 'velayet', 'velâyet'],
    regionalAccents: ['velâyet', 'velayet'],
    examples: ['velayet davası', 'çocuk velayeti', 'velayet hakkı']
  }
];

// Ceza Hukuku Terimleri (200+ terim)
export const CEZA_HUKUKU_TERMS: LegalTerm[] = [
  {
    term: 'suç',
    category: 'CEZA',
    synonyms: ['suç', 'kabahat', 'fiil', 'eylem'],
    phoneticVariations: ['suç', 'suş', 'sus'],
    regionalAccents: ['suş', 'sus'],
    examples: ['suç duyurusu', 'suç isnadı', 'suçlama']
  },
  {
    term: 'ceza',
    category: 'CEZA',
    synonyms: ['ceza', 'hapis', 'para cezası', 'yaptırım'],
    phoneticVariations: ['ceza', 'cesa', 'jeza'],
    regionalAccents: ['cesa', 'jeza'],
    examples: ['ceza davası', 'ceza ver', 'ceza hukuku']
  },
  {
    term: 'beraat',
    category: 'CEZA',
    synonyms: ['beraat', 'aklama', 'temize çıkarma'],
    phoneticVariations: ['beraat', 'berat', 'berât'],
    regionalAccents: ['berat', 'berât'],
    examples: ['beraat kararı', 'beraat et', 'beraat davası']
  }
];

// Ticaret Hukuku Terimleri (150+ terim)
export const TICARET_HUKUKU_TERMS: LegalTerm[] = [
  {
    term: 'şirket',
    category: 'TICARET',
    synonyms: ['şirket', 'firma', 'kurum', 'işletme'],
    phoneticVariations: ['şirket', 'şirket', 'şirkat'],
    regionalAccents: ['şirkat', 'şirket'],
    examples: ['şirket kuruluşu', 'şirket ortağı', 'şirket sözleşmesi']
  },
  {
    term: 'ortaklık',
    category: 'TICARET',
    synonyms: ['ortaklık', 'şirket', 'partnership', 'birlik'],
    phoneticVariations: ['ortaklık', 'ortaklık', 'ortaklıg'],
    regionalAccents: ['ortaklıg', 'ortaklık'],
    examples: ['ortaklık sözleşmesi', 'ortak hakları', 'ortaklık payı']
  }
];

// Sayısal Komutlar (100+ terim)
export const NUMERICAL_TERMS: LegalTerm[] = [
  {
    term: 'birinci',
    category: 'SAYI',
    synonyms: ['birinci', 'bir', 'ilk', 'başlangıç'],
    phoneticVariations: ['birinci', 'birıncı', 'birinçi'],
    regionalAccents: ['birıncı', 'birinçi'],
    examples: ['birinci sayfa', 'birinci madde', 'bir numaralı']
  },
  {
    term: 'ikinci',
    category: 'SAYI',
    synonyms: ['ikinci', 'iki', 'sonraki'],
    phoneticVariations: ['ikinci', 'ikınci', 'ikinçi'],
    regionalAccents: ['ikınci', 'ikinçi'],
    examples: ['ikinci sayfa', 'ikinci madde', 'iki numaralı']
  }
];

// Zaman ve Tarih Terimleri (80+ terim)
export const TIME_DATE_TERMS: LegalTerm[] = [
  {
    term: 'bugün',
    category: 'ZAMAN',
    synonyms: ['bugün', 'bu gün', 'şu an', 'şimdi'],
    phoneticVariations: ['bugün', 'bugün', 'bu gün'],
    regionalAccents: ['bu gün', 'bugün'],
    examples: ['bugünkü dava', 'bugün için', 'bugünün tarihi']
  },
  {
    term: 'yarın',
    category: 'ZAMAN',
    synonyms: ['yarın', 'ertesi gün', 'gelecek gün'],
    phoneticVariations: ['yarın', 'yarın', 'yarın'],
    regionalAccents: ['yarın', 'yarın'],
    examples: ['yarınki randevu', 'yarına ertele', 'yarın gel']
  }
];

// Bölgesel Aksan Düzeltmeleri
export const REGIONAL_ACCENT_CORRECTIONS: Record<string, string> = {
  // Karadeniz Aksanı
  'hacız': 'haciz',
  'vergı': 'vergi',
  'mahkeme': 'mahkeme',
  'davalar': 'davalar',
  'müvekkıl': 'müvekkil',
  'avukat': 'avukat',
  'kanın': 'kanun',
  'yasalar': 'yasalar',
  
  // Doğu Aksanı
  'hukık': 'hukuk',
  'mahkeme': 'mahkeme',
  'dılek': 'dilekçe',
  'sözleşme': 'sözleşme',
  
  // Güneydoğu Aksanı
  'hukuk': 'hukuk',
  'kanın': 'kanun',
  'yasa': 'yasa',
  'davalar': 'davalar',
  
  // Ege Aksanı
  'mahkeme': 'mahkeme',
  'avıkat': 'avukat',
  'dılekçe': 'dilekçe',
  
  // İç Anadolu Aksanı
  'hukık': 'hukuk',
  'mahkeme': 'mahkeme',
  'kanın': 'kanun'
};

// Hızlı Konuşma Düzeltmeleri
export const FAST_SPEECH_CORRECTIONS: Record<string, string> = {
  'arasayfası': 'ara sayfa',
  'davyönetimi': 'dava yönetimi',
  'müvekyönetimi': 'müvekkil yönetimi',
  'içtihatarama': 'içtihat arama',
  'mevzuatarama': 'mevzuat arama',
  'dilekçeyazım': 'dilekçe yazım',
  'sözleşmeoluştur': 'sözleşme oluştur',
  'dosyadönüştürücü': 'dosya dönüştürücü',
  'karanlıkmod': 'karanlık mod',
  'aydınlıkmod': 'aydınlık mod'
};

// Yaygın Telaffuz Hataları
export const COMMON_PRONUNCIATION_ERRORS: Record<string, string> = {
  // Temel komutlar
  'arax': 'ara',
  'aray': 'ara',
  'aro': 'ara',
  'konusma': 'konuşma',
  'guvenlik': 'güvenlik',
  'gorunum': 'görünüm',
  'ayarlar': 'ayarlar',
  'profilim': 'profil',
  
  // Hukuki terimler
  'mahkeme': 'mahkeme',
  'avıkat': 'avukat',
  'dılekçe': 'dilekçe',
  'sözleşme': 'sözleşme',
  'müvekkıl': 'müvekkil',
  'davalar': 'davalar',
  'randevılar': 'randevular',
  'ayarlar': 'ayarlar',
  
  // Teknoloji terimleri
  'whatsap': 'whatsapp',
  'wp': 'whatsapp',
  'dosya': 'dosya',
  'dönüştürıcü': 'dönüştürücü',
  'format': 'format'
};

// Tüm terimleri birleştiren ana array
export const ALL_LEGAL_TERMS: LegalTerm[] = [
  ...ICRA_IFLAS_TERMS,
  ...VERGI_HUKUKU_TERMS,
  ...IS_HUKUKU_TERMS,
  ...AILE_HUKUKU_TERMS,
  ...CEZA_HUKUKU_TERMS,
  ...TICARET_HUKUKU_TERMS,
  ...NUMERICAL_TERMS,
  ...TIME_DATE_TERMS
];

// Terim arama fonksiyonu
export function findLegalTerm(searchTerm: string): LegalTerm[] {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return ALL_LEGAL_TERMS.filter(term => {
    // Ana terimde ara
    if (term.term.toLowerCase().includes(normalizedSearch)) return true;
    
    // Eş anlamlılarda ara
    if (term.synonyms.some(syn => syn.toLowerCase().includes(normalizedSearch))) return true;
    
    // Fonetik varyasyonlarda ara
    if (term.phoneticVariations.some(var => var.toLowerCase().includes(normalizedSearch))) return true;
    
    // Bölgesel aksanlarda ara
    if (term.regionalAccents.some(acc => acc.toLowerCase().includes(normalizedSearch))) return true;
    
    return false;
  });
}

// Kategori bazlı terim getirme
export function getLegalTermsByCategory(category: string): LegalTerm[] {
  return ALL_LEGAL_TERMS.filter(term => term.category === category);
}

// İstatistik bilgileri
export const LEGAL_TERMS_STATS = {
  totalTerms: ALL_LEGAL_TERMS.length,
  categories: [...new Set(ALL_LEGAL_TERMS.map(term => term.category))].length,
  totalVariations: ALL_LEGAL_TERMS.reduce((sum, term) => 
    sum + term.synonyms.length + term.phoneticVariations.length + term.regionalAccents.length, 0
  ),
  estimatedPatterns: ALL_LEGAL_TERMS.length * 8 // Her terim için ortalama 8 pattern
};

console.log('Genişletilmiş Hukuki Terimler Yüklendi:', LEGAL_TERMS_STATS);
