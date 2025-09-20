// Mevzuat_3 için hukuki komut kütüphanesi
// Bu dosya, hukuki terimler ve komutlar için kapsamlı bir referans sağlar

export interface LegalCommand {
  id: string;
  category: string;
  patterns: string[];
  action: string;
  parameters: string[];
  description: string;
  examples: string[];
  keywords: string[];
  synonyms: string[];
  relatedCommands: string[];
}

// Hukuki komut kategorileri
export const LEGAL_CATEGORIES = {
  NAVIGASYON: 'Navigasyon',
  ARAMA_SORGULAMA: 'Arama ve Sorgulama',
  DAVA_YONETIMI: 'Dava Yönetimi',
  MUVEKKIL_ISLEMLERI: 'Müvekkil İşlemleri',
  BELGE_ISLEMLERI: 'Belge İşlemleri',
  TAKVIM_YONETIMI: 'Takvim Yönetimi',
  MALI_ISLEMLER: 'Mali İşlemler',
  RAPORLAMA: 'Raporlama',
  ILETISIM: 'İletişim',
  SISTEM: 'Sistem',
  GORUNUM: 'Görünüm',
  DIKTE: 'Dikte',
  GUVENLIK: 'Güvenlik',
  HIZLI_ERISIM: 'Hızlı Erişim',
  AKTARIM: 'Veri Aktarımı',
  GOREV: 'Görev ve Hatırlatma',
};

// Hukuki terimler sözlüğü
export const LEGAL_TERMS = {
  // Dava türleri
  CASE_TYPES: {
    boşanma: ['boşanma', 'bosanma', 'ayrılık', 'ayrılma', 'evlilik bitimi', 'nikah iptali'],
    nafaka: ['nafaka', 'nafakaa', 'yoksulluk nafakası', 'iştirak nafakası', 'tedbir nafakası', 'geçici nafaka'],
    velayet: ['velayet', 'çocuk velayeti', 'ortak velayet', 'tek velayet', 'velayet hakkı'],
    tazminat: ['tazminat', 'maddi tazminat', 'manevi tazminat', 'zarar ziyan', 'hasar tazminatı'],
    alacak: ['alacak', 'alacak davası', 'borç alacak', 'ticari alacak', 'kira alacağı'],
    icra: ['icra', 'icra takibi', 'haciz', 'icra müdürlüğü', 'icra dairesi'],
    itiraz: ['itiraz', 'itiraz davası', 'borca itiraz', 'icra itirazı', 'itiraz dilekçesi'],
    miras: ['miras', 'miras davası', 'mirasçılık', 'miras payı', 'miras reddi'],
    tapu: ['tapu', 'tapu iptali', 'tapu tescil', 'tapu davası', 'gayrimenkul'],
    kira: ['kira', 'kira davası', 'kira sözleşmesi', 'kira feshi', 'kira artışı'],
  },

  // Hukuki işlemler
  LEGAL_ACTIONS: {
    dilekçe: ['dilekçe yaz', 'dilekçe hazırla', 'dilekçe oluştur', 'layiha hazırla', 'dilekçe düzenle'],
    başvuru: ['başvuru yap', 'müracaat et', 'talepte bulun', 'istekte bulun', 'başvuru formu'],
    temyiz: ['temyiz et', 'yargıtay', 'üst mahkemeye başvur', 'temyiz dilekçesi'],
    istinaf: ['istinaf başvurusu', 'bölge adliye mahkemesi', 'istinafa git', 'istinaf dilekçesi'],
    keşif: ['keşif talep et', 'yerinde inceleme', 'keşif istemi', 'keşif tutanağı'],
    bilirkişi: ['bilirkişi talep et', 'eksper iste', 'uzman görüşü', 'bilirkişi raporu'],
    tanık: ['tanık dinle', 'tanık çağır', 'tanık ifadesi', 'tanık listesi'],
    delil: ['delil topla', 'delil sun', 'delil incele', 'delil değerlendir'],
  },

  // Belge türleri
  DOCUMENT_TYPES: {
    vekaletname: ['vekaletname', 'vekalet', 'yetki belgesi', 'temsil yetkisi', 'vekil tayini'],
    tebligat: ['tebligat', 'tebliğ', 'resmi yazı', 'mahkeme tebligatı', 'tebligat tutanağı'],
    tutanak: ['tutanak', 'zabıt', 'kayıt', 'oturum tutanağı', 'duruşma tutanağı'],
    sözleşme: ['sözleşme', 'kontrat', 'mukavele', 'anlaşma', 'akit', 'sözleşme metni'],
    senet: ['senet', 'borç senedi', 'emre muharrer senet', 'bono', 'çek'],
    makbuz: ['makbuz', 'alındı', 'tahsilat makbuzu', 'ödeme belgesi', 'makbuz kes'],
    fatura: ['fatura', 'fatura kes', 'fatura düzenle', 'e-fatura', 'fatura listesi'],
    rapor: ['rapor', 'rapor hazırla', 'rapor oluştur', 'analiz raporu', 'durum raporu'],
  },

  // Mahkeme ve kurumlar
  INSTITUTIONS: {
    mahkeme: ['mahkeme', 'adliye', 'yargı', 'hukuk mahkemesi', 'ceza mahkemesi', 'asliye mahkemesi'],
    icra: ['icra müdürlüğü', 'icra dairesi', 'icra hukuk', 'icra memuru'],
    noter: ['noter', 'noterlik', 'noter katibi', 'noter tasdiki'],
    baro: ['baro', 'baro başkanlığı', 'avukatlar odası', 'baro kaydı'],
    adlitıp: ['adli tıp', 'adli tıp kurumu', 'atk', 'adli tıp raporu'],
    savcılık: ['savcılık', 'cumhuriyet savcılığı', 'savcı', 'savcılık makamı'],
    polis: ['polis', 'emniyet', 'karakol', 'polis merkezi'],
  },

  // Zaman ifadeleri
  TIME_EXPRESSIONS: {
    bugün: ['bugün', 'bu gün', 'bugünkü', 'bugün için', 'güncel'],
    yarın: ['yarın', 'yarınki', 'ertesi gün', 'gelecek gün'],
    dün: ['dün', 'dünkü', 'önceki gün', 'geçen gün'],
    hafta: ['bu hafta', 'gelecek hafta', 'geçen hafta', 'haftaya', 'haftalık'],
    ay: ['bu ay', 'gelecek ay', 'geçen ay', 'ayın sonu', 'ay başı', 'aylık'],
    yıl: ['bu yıl', 'gelecek yıl', 'geçen yıl', 'yıl sonu', 'yıl başı', 'yıllık'],
  },

  // Mali terimler
  FINANCIAL_TERMS: {
    ödeme: ['ödeme', 'tahsilat', 'para', 'nakit', 'ödeme yap'],
    fatura: ['fatura', 'fatura kes', 'fatura düzenle', 'e-fatura'],
    makbuz: ['makbuz', 'alındı', 'makbuz kes', 'tahsilat makbuzu'],
    borç: ['borç', 'borçlu', 'borç listesi', 'borç takibi'],
    alacak: ['alacak', 'alacaklı', 'alacak listesi', 'alacak takibi'],
    vergi: ['vergi', 'vergi beyannamesi', 'vergi ödemesi', 'vergi dairesi'],
  },
};

// Hukuki komut kombinasyonları
export const LEGAL_COMMAND_COMBINATIONS = {
  // Dava + Eylem kombinasyonları
  CASE_ACTION: [
    'yeni dava aç',
    'dava dosyası aç',
    'dava durumu sorgula',
    'dava güncelle',
    'dava kapat',
    'dava arşivle',
  ],

  // Müvekkil + İşlem kombinasyonları
  CLIENT_ACTION: [
    'müvekkil ekle',
    'müvekkil güncelle',
    'müvekkil ara',
    'müvekkil sil',
    'müvekkil listesi',
    'müvekkil detayları',
  ],

  // Belge + İşlem kombinasyonları
  DOCUMENT_ACTION: [
    'dilekçe yaz',
    'sözleşme hazırla',
    'vekaletname oluştur',
    'belge kaydet',
    'belge yazdır',
    'belge gönder',
  ],

  // Arama + Terim kombinasyonları
  SEARCH_TERM: [
    'boşanma ara',
    'nafaka ara',
    'tazminat ara',
    'icra ara',
    'miras ara',
    'kira ara',
  ],
};

// Hukuki komut öncelikleri
export const LEGAL_COMMAND_PRIORITIES = {
  HIGH: [
    'dilekçe yaz',
    'sözleşme oluştur',
    'dava aç',
    'müvekkil ekle',
    'randevu al',
    'ara',
  ],
  MEDIUM: [
    'dava güncelle',
    'müvekkil güncelle',
    'belge kaydet',
    'rapor oluştur',
    'fatura kes',
  ],
  LOW: [
    'ayarlar',
    'profil',
    'tema değiştir',
    'dikte başlat',
    'ses ayarla',
  ],
};

// Hukuki komut geçmişi analizi
export class LegalCommandAnalyzer {
  private commandHistory: string[] = [];
  private categoryUsage: Record<string, number> = {};
  private termFrequency: Record<string, number> = {};

  addCommand(command: string, category: string): void {
    this.commandHistory.push(command);
    this.categoryUsage[category] = (this.categoryUsage[category] || 0) + 1;
    
    // Terim frekansını güncelle
    const words = command.toLowerCase().split(' ');
    words.forEach(word => {
      this.termFrequency[word] = (this.termFrequency[word] || 0) + 1;
    });
  }

  getMostUsedCategories(): Array<{ category: string; count: number }> {
    return Object.entries(this.categoryUsage)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getMostUsedTerms(): Array<{ term: string; count: number }> {
    return Object.entries(this.termFrequency)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getCommandSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // En çok kullanılan kategorilere göre öneriler
    const topCategories = this.getMostUsedCategories().slice(0, 3);
    topCategories.forEach(({ category }) => {
      const categoryCommands = Object.values(LEGAL_TERMS).flatMap(terms => 
        Object.values(terms).flat()
      );
      suggestions.push(...categoryCommands.slice(0, 2));
    });

    return suggestions.slice(0, 5);
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
    this.categoryUsage = {};
    this.termFrequency = {};
  }
}

// Hukuki komut validasyonu
export class LegalCommandValidator {
  static validateCommand(command: string): { isValid: boolean; suggestions: string[] } {
    const normalizedCommand = command.toLowerCase().trim();
    const suggestions: string[] = [];

    // Temel komut kontrolü
    const basicCommands = [
      'ara', 'aç', 'kaydet', 'sil', 'düzenle', 'yazdır', 'gönder',
      'dilekçe', 'sözleşme', 'dava', 'müvekkil', 'randevu'
    ];

    const hasBasicCommand = basicCommands.some(cmd => 
      normalizedCommand.includes(cmd)
    );

    if (!hasBasicCommand) {
      suggestions.push('Komut bulunamadı. Temel komutları deneyin:');
      suggestions.push(...basicCommands.slice(0, 5));
    }

    // Hukuki terim kontrolü
    const legalTerms = Object.values(LEGAL_TERMS).flatMap(terms => 
      Object.values(terms).flat()
    );

    const hasLegalTerm = legalTerms.some(term => 
      normalizedCommand.includes(term.toLowerCase())
    );

    if (!hasLegalTerm) {
      suggestions.push('Hukuki terim bulunamadı. Örnekler:');
      suggestions.push('boşanma', 'nafaka', 'tazminat', 'icra', 'miras');
    }

    return {
      isValid: hasBasicCommand && hasLegalTerm,
      suggestions
    };
  }

  static getCommandHelp(command: string): string {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Komut kategorisine göre yardım
    if (normalizedCommand.includes('dilekçe')) {
      return 'Dilekçe yazım komutları: "dilekçe yaz", "layiha hazırla", "dilekçe oluştur"';
    }
    
    if (normalizedCommand.includes('sözleşme')) {
      return 'Sözleşme komutları: "sözleşme oluştur", "kontrat hazırla", "mukavele oluştur"';
    }
    
    if (normalizedCommand.includes('dava')) {
      return 'Dava komutları: "yeni dava", "dava aç", "dava güncelle", "dava ara"';
    }
    
    if (normalizedCommand.includes('müvekkil')) {
      return 'Müvekkil komutları: "müvekkil ekle", "müvekkil ara", "müvekkil güncelle"';
    }
    
    return 'Genel komutlar: "ara", "aç", "kaydet", "sil", "düzenle"';
  }
}

// Hukuki komut istatistikleri
export interface LegalCommandStats {
  totalCommands: number;
  categoryUsage: Record<string, number>;
  termFrequency: Record<string, number>;
  mostUsedCommands: Array<{ command: string; count: number }>;
  dailyUsage: Record<string, number>;
  weeklyUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
  averageConfidence: number;
  successRate: number;
  errorRate: number;
}

export class LegalCommandStatsCollector {
  private stats: LegalCommandStats = {
    totalCommands: 0,
    categoryUsage: {},
    termFrequency: {},
    mostUsedCommands: [],
    dailyUsage: {},
    weeklyUsage: {},
    monthlyUsage: {},
    averageConfidence: 0,
    successRate: 0,
    errorRate: 0,
  };

  recordCommand(command: string, category: string, confidence: number, success: boolean): void {
    this.stats.totalCommands++;
    
    // Kategori kullanımı
    this.stats.categoryUsage[category] = (this.stats.categoryUsage[category] || 0) + 1;
    
    // Komut kullanımı
    const existingCommand = this.stats.mostUsedCommands.find(c => c.command === command);
    if (existingCommand) {
      existingCommand.count++;
    } else {
      this.stats.mostUsedCommands.push({ command, count: 1 });
    }
    
    // Güven skoru
    this.stats.averageConfidence = 
      (this.stats.averageConfidence * (this.stats.totalCommands - 1) + confidence) / 
      this.stats.totalCommands;
    
    // Başarı oranı
    if (success) {
      this.stats.successRate = 
        (this.stats.successRate * (this.stats.totalCommands - 1) + 1) / 
        this.stats.totalCommands;
    } else {
      this.stats.errorRate = 
        (this.stats.errorRate * (this.stats.totalCommands - 1) + 1) / 
        this.stats.totalCommands;
    }
    
    // Günlük kullanım
    const today = new Date().toISOString().split('T')[0];
    this.stats.dailyUsage[today] = (this.stats.dailyUsage[today] || 0) + 1;
  }

  getStats(): LegalCommandStats {
    return { ...this.stats };
  }

  exportStats(): string {
    return JSON.stringify(this.stats, null, 2);
  }

  importStats(statsJson: string): void {
    try {
      this.stats = JSON.parse(statsJson);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  }
}

// Hukuki komut kütüphanesi ana sınıfı
export class LegalCommandLibrary {
  private analyzer: LegalCommandAnalyzer;
  private validator: LegalCommandValidator;
  private statsCollector: LegalCommandStatsCollector;

  constructor() {
    this.analyzer = new LegalCommandAnalyzer();
    this.validator = new LegalCommandValidator();
    this.statsCollector = new LegalCommandStatsCollector();
  }

  // Komut işleme
  processCommand(command: string, category: string, confidence: number): {
    success: boolean;
    suggestions: string[];
    help: string;
  } {
    const validation = this.validator.validateCommand(command);
    const help = this.validator.getCommandHelp(command);
    
    this.analyzer.addCommand(command, category);
    this.statsCollector.recordCommand(command, category, confidence, validation.isValid);
    
    return {
      success: validation.isValid,
      suggestions: validation.suggestions,
      help
    };
  }

  // Komut önerileri
  getSuggestions(input: string): string[] {
    return this.analyzer.getCommandSuggestions();
  }

  // İstatistikler
  getStats(): LegalCommandStats {
    return this.statsCollector.getStats();
  }

  // Komut geçmişi
  getCommandHistory(): string[] {
    return this.analyzer.getCommandHistory();
  }

  // Geçmişi temizle
  clearHistory(): void {
    this.analyzer.clearHistory();
  }

  // İstatistikleri dışa aktar
  exportStats(): string {
    return this.statsCollector.exportStats();
  }

  // İstatistikleri içe aktar
  importStats(statsJson: string): void {
    this.statsCollector.importStats(statsJson);
  }
}

// Varsayılan hukuki komut kütüphanesi instance'ı
export const legalCommandLibrary = new LegalCommandLibrary();

// Hukuki komut kategorileri için yardımcı fonksiyonlar
export function getCategoryCommands(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    [LEGAL_CATEGORIES.NAVIGASYON]: [
      'ana sayfa', 'hukuk asistanı', 'içtihat arama', 'dilekçe yazım',
      'sözleşme oluştur', 'dava yönetimi', 'müvekkil yönetimi'
    ],
    [LEGAL_CATEGORIES.ARAMA_SORGULAMA]: [
      'ara', 'içtihat ara', 'karar ara', 'mevzuat ara', 'yargıtay kararı ara'
    ],
    [LEGAL_CATEGORIES.DAVA_YONETIMI]: [
      'yeni dava', 'dava aç', 'dava güncelle', 'dava ara', 'aktif davalar'
    ],
    [LEGAL_CATEGORIES.MUVEKKIL_ISLEMLERI]: [
      'müvekkil ekle', 'müvekkil ara', 'müvekkil güncelle', 'müvekkil listesi'
    ],
    [LEGAL_CATEGORIES.BELGE_ISLEMLERI]: [
      'dilekçe yaz', 'sözleşme hazırla', 'vekaletname', 'belge kaydet'
    ],
  };

  return categoryMap[category] || [];
}

// Hukuki terimler için arama fonksiyonu
export function searchLegalTerms(query: string): Array<{ term: string; category: string; synonyms: string[] }> {
  const results: Array<{ term: string; category: string; synonyms: string[] }> = [];
  const normalizedQuery = query.toLowerCase().trim();

  Object.entries(LEGAL_TERMS).forEach(([category, terms]) => {
    Object.entries(terms).forEach(([term, synonyms]) => {
      if (term.toLowerCase().includes(normalizedQuery) || 
          synonyms.some(synonym => synonym.toLowerCase().includes(normalizedQuery))) {
        results.push({
          term,
          category,
          synonyms
        });
      }
    });
  });

  return results;
}

// Hukuki komut kombinasyonları oluşturucu
export function generateLegalCommandCombinations(): string[] {
  const combinations: string[] = [];

  Object.values(LEGAL_COMMAND_COMBINATIONS).forEach(categoryCombinations => {
    combinations.push(...categoryCombinations);
  });

  return combinations;
}

// Hukuki komut öncelik sıralaması
export function prioritizeLegalCommands(commands: string[]): string[] {
  const prioritized: string[] = [];
  
  // Yüksek öncelikli komutlar
  LEGAL_COMMAND_PRIORITIES.HIGH.forEach(highPriority => {
    const matching = commands.filter(cmd => cmd.includes(highPriority));
    prioritized.push(...matching);
  });
  
  // Orta öncelikli komutlar
  LEGAL_COMMAND_PRIORITIES.MEDIUM.forEach(mediumPriority => {
    const matching = commands.filter(cmd => cmd.includes(mediumPriority));
    prioritized.push(...matching);
  });
  
  // Düşük öncelikli komutlar
  LEGAL_COMMAND_PRIORITIES.LOW.forEach(lowPriority => {
    const matching = commands.filter(cmd => cmd.includes(lowPriority));
    prioritized.push(...matching);
  });

  return prioritized;
}
