// Ses sistemi konfigürasyonu ve ayarları

export const VOICE_CONFIG = {
  // Temel ayarlar
  DEFAULT_LANGUAGE: 'tr-TR',
  DEFAULT_CONTINUOUS: true,
  DEFAULT_INTERIM_RESULTS: true,
  
  // Bulanık eşleştirme ayarları
  FUZZY_ENABLED: true,
  FUZZY_THRESHOLD: 0.6,
  FUZZY_STRICT_SCORE: 0.8,
  FUZZY_CONTEXT_SCORE: 0.7,
  
  // Performans ayarları
  MAX_COMMAND_HISTORY: 10,
  COMMAND_TIMEOUT: 5000,
  RECOGNITION_TIMEOUT: 10000,
  
  // UI ayarları
  SHOW_CONFIDENCE: false,
  SHOW_TRANSCRIPT: true,
  AUTO_HIDE_TRANSCRIPT: 3000,
  
  // Güvenlik ayarları
  MIN_CONFIDENCE: 0.0,
  MAX_COMMANDS_PER_MINUTE: 60,
  
  // Ses ayarları
  VOLUME_THRESHOLD: 0.1,
  SILENCE_TIMEOUT: 2000,
  
  // Hata yönetimi
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
  MAX_BACKOFF: 5000,
};

// LocalStorage anahtarları
export const VOICE_STORAGE_KEYS = {
  LANGUAGE: 'voice_recognition_lang',
  CONTINUOUS: 'voice_continuous',
  INTERIM_RESULTS: 'voice_interim_results',
  FUZZY_ENABLED: 'voice_fuzzy_enabled',
  FUZZY_THRESHOLD: 'voice_fuzzy_threshold',
  MIN_CONFIDENCE: 'voice_min_confidence',
  AUTO_RESTART: 'voice_autorestart',
  TTS_GATE: 'voice_tts_gate',
  COMMAND_HISTORY: 'voice_command_history',
  USER_PREFERENCES: 'voice_user_preferences',
};

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: 'tr-TR', name: 'Türkçe', nativeName: 'Türkçe' },
  { code: 'en-US', name: 'İngilizce', nativeName: 'English' },
  { code: 'en-GB', name: 'İngilizce (UK)', nativeName: 'English (UK)' },
];

// Ses komutları kategorileri
export const VOICE_CATEGORIES = {
  NAVIGASYON: 'Navigasyon',
  ARAMA_SORGULAMA: 'Arama ve Sorgulama',
  GORUNUM: 'Görünüm',
  DIKTE: 'Dikte',
  DAVA_YONETIMI: 'Dava Yönetimi',
  MUVEKKIL_ISLEMLERI: 'Müvekkil İşlemleri',
  BELGE_ISLEMLERI: 'Belge İşlemleri',
  TAKVIM_YONETIMI: 'Takvim Yönetimi',
  SISTEM: 'Sistem',
  FINANS: 'Finans',
  RAPOR: 'Rapor',
  ILETISIM: 'İletişim',
  GUVENLIK: 'Güvenlik',
  HIZLI: 'Hızlı Erişim',
  AKTARIM: 'Veri Aktarımı',
  GOREV: 'Görev ve Hatırlatma',
  COMBINED: 'Kombine Komutlar',
  NAV: 'Navigasyon Kombinasyonları',
  LIST: 'Liste İşlemleri',
  NAV_TIME: 'Zaman Bazlı Navigasyon',
};

// Hata kodları ve mesajları
export const VOICE_ERRORS = {
  'no-speech': 'Konuşma algılanmadı. Lütfen tekrar deneyin.',
  'audio-capture': 'Mikrofon erişimi sağlanamadı. Mikrofon iznini kontrol edin.',
  'not-allowed': 'Mikrofon izni reddedildi. Tarayıcı ayarlarından izin verin.',
  'service-not-allowed': 'Ses tanıma servisi kullanılamıyor. HTTPS gereklidir.',
  'bad-grammar': 'Dilbilgisi hatası. Lütfen daha net konuşun.',
  'language-not-supported': 'Dil desteklenmiyor. Türkçe kullanın.',
  'network-error': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
  'aborted': 'Ses tanıma iptal edildi.',
  'low-confidence': 'Güven değeri düşük. Lütfen daha net konuşun.',
  'unknown': 'Bilinmeyen hata oluştu.',
};

// Başarı mesajları
export const VOICE_SUCCESS_MESSAGES = {
  'command-recognized': 'Komut tanındı',
  'navigation-success': 'Sayfa değiştirildi',
  'search-success': 'Arama yapıldı',
  'theme-changed': 'Tema değiştirildi',
  'dictation-started': 'Dikte başlatıldı',
  'dictation-stopped': 'Dikte durduruldu',
  'dictation-saved': 'Dikte kaydedildi',
};

// Varsayılan komutlar
export const DEFAULT_COMMANDS = [
  'ana sayfa',
  'davalar',
  'müvekkiller',
  'randevular',
  'ayarlar',
  'ara',
  'karanlık mod',
  'aydınlık mod',
  'dikte başlat',
  'dikte durdur',
];

// Komut istatistikleri için varsayılan değerler
export const DEFAULT_STATS = {
  totalCommands: 0,
  successfulCommands: 0,
  failedCommands: 0,
  averageConfidence: 0,
  mostUsedCommands: [],
  categoryUsage: {},
  dailyUsage: {},
  weeklyUsage: {},
  monthlyUsage: {},
};

// Performans metrikleri
export const PERFORMANCE_METRICS = {
  RECOGNITION_TIME: 'recognition_time',
  PROCESSING_TIME: 'processing_time',
  RESPONSE_TIME: 'response_time',
  ACCURACY_RATE: 'accuracy_rate',
  SUCCESS_RATE: 'success_rate',
  ERROR_RATE: 'error_rate',
};

// Gelişmiş ayarlar
export const ADVANCED_SETTINGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_PERFORMANCE_TRACKING: true,
  ENABLE_USER_BEHAVIOR_TRACKING: false,
  ENABLE_COMMAND_SUGGESTIONS: true,
  ENABLE_CONTEXT_AWARENESS: true,
  ENABLE_PHONETIC_CORRECTION: true,
  ENABLE_FUZZY_MATCHING: true,
  ENABLE_COMMAND_HISTORY: true,
  ENABLE_AUTO_COMPLETE: true,
  ENABLE_VOICE_FEEDBACK: true,
};

// Test ayarları
export const TEST_SETTINGS = {
  ENABLE_TEST_MODE: false,
  MOCK_RECOGNITION: false,
  SIMULATE_ERRORS: false,
  LOG_ALL_COMMANDS: false,
  VERBOSE_LOGGING: false,
};

// Export edilen sabitler
export const VOICE_FUZZY_ENABLED = VOICE_CONFIG.FUZZY_ENABLED;
export const VOICE_FUZZY_THRESHOLD = VOICE_CONFIG.FUZZY_THRESHOLD;
export const VOICE_FUZZY_STRICT_SCORE = VOICE_CONFIG.FUZZY_STRICT_SCORE;
export const VOICE_FUZZY_CONTEXT_SCORE = VOICE_CONFIG.FUZZY_CONTEXT_SCORE;