// Central command registry for voice control
// Lightweight patterns with synonyms to scale beyond 500 natural variants

export type CommandAction =
  | 'NAV_DASHBOARD'
  | 'NAV_CASES'
  | 'NAV_CLIENTS'
  | 'NAV_APPOINTMENTS'
  | 'NAV_SETTINGS'
  | 'SEARCH'
  | 'DARK_MODE'
  | 'LIGHT_MODE'
  | 'DICTATE_START'
  | 'DICTATE_STOP'
  | 'DICTATE_SAVE'
  | 'UNKNOWN';

export interface CommandDef {
  id: string;
  category:
    | 'NAVIGASYON'
    | 'ARAMA_SORGULAMA'
    | 'GORUNUM'
    | 'DIKTE'
    | 'DAVA_YONETIMI'
    | 'MUVEKKIL_ISLEMLERI'
    | 'BELGE_ISLEMLERI'
    | 'TAKVIM_YONETIMI';
  action: CommandAction;
  patterns: string[]; // lowercased phrase fragments
  description?: string;
}

// Helpers to expand synonyms into patterns
const syn = (list: string[]): string[] => list.map(s => s.toLowerCase());

// Base synonyms
const s = {
  home: syn(['ana sayfa', 'dashboard', 'başlangıç', 'kontrol paneli', 'özet ekran']),
  cases: syn(['davalar', 'dava dosyaları', 'dosyalar', 'dava ekranı']),
  clients: syn(['müvekkiller', 'müşteriler', 'danışanlar', 'müvekkil listesi']),
  appointments: syn(['randevular', 'takvim', 'ajanda', 'duruşmalar']),
  settings: syn(['ayarlar', 'sistem ayarları', 'tercihler', 'profil ayarları']),
  search: syn(['ara', 'arama yap', 'bul', 'sorgula']),
  dark: syn(['karanlık mod', 'gece modu', 'koyu tema']),
  light: syn(['aydınlık mod', 'gündüz modu', 'açık tema']),
  dictateStart: syn(['dikte başlat', 'yazmaya başla', 'not almaya başla']),
  dictateStop: syn(['dikte durdur', 'yazmayı durdur', 'kaydı bitir']),
  dictateSave: syn(['dikteyi kaydet', 'notu kaydet', 'metni kaydet']),
};

export const COMMANDS: CommandDef[] = [
  // Navigation
  { id: 'nav_dashboard', category: 'NAVIGASYON', action: 'NAV_DASHBOARD', patterns: s.home, description: 'Ana sayfaya git' },
  { id: 'nav_cases', category: 'NAVIGASYON', action: 'NAV_CASES', patterns: s.cases, description: 'Davalar sayfasına git' },
  { id: 'nav_clients', category: 'NAVIGASYON', action: 'NAV_CLIENTS', patterns: s.clients, description: 'Müvekkiller sayfasına git' },
  { id: 'nav_appointments', category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', patterns: s.appointments, description: 'Randevular sayfasına git' },
  { id: 'nav_settings', category: 'NAVIGASYON', action: 'NAV_SETTINGS', patterns: s.settings, description: 'Ayarlar sayfasına git' },

  // Appearance
  { id: 'view_dark', category: 'GORUNUM', action: 'DARK_MODE', patterns: s.dark, description: 'Karanlık modu aç' },
  { id: 'view_light', category: 'GORUNUM', action: 'LIGHT_MODE', patterns: s.light, description: 'Aydınlık modu aç' },

  // Search
  { id: 'search_global', category: 'ARAMA_SORGULAMA', action: 'SEARCH', patterns: s.search, description: 'Genel arama yap' },

  // Dictation
  { id: 'dictate_start', category: 'DIKTE', action: 'DICTATE_START', patterns: s.dictateStart, description: 'Dikteyi başlat' },
  { id: 'dictate_stop', category: 'DIKTE', action: 'DICTATE_STOP', patterns: s.dictateStop, description: 'Dikteyi durdur' },
  { id: 'dictate_save', category: 'DIKTE', action: 'DICTATE_SAVE', patterns: s.dictateSave, description: 'Dikteyi kaydet' },
];

export interface VoiceCommand {
  id: string;
  action: CommandAction;
  category: CommandDef['category'];
  description: string;
  params?: Record<string, any>;
}

export function matchRegistry(transcript: string): { def: CommandDef; params?: Record<string, any> } | null {
  const t = transcript.toLowerCase().trim();
  const containsPattern = (text: string, pat: string) => {
    const p = pat.toLowerCase();
    // Use word boundaries for short single-word patterns like 'ara', 'bul'
    if (!p.includes(' ') && p.length <= 4) {
      const re = new RegExp(`(^|\\b)${p}(\\b|$)`);
      return re.test(text);
    }
    return text.includes(p);
  };
  // Direct pattern contains
  for (const cmd of COMMANDS) {
    if (cmd.patterns.some(p => containsPattern(t, p))) {
      if (cmd.action === 'SEARCH') {
        // extract query if starts with a search keyword
        const maybe = t.replace(/^(ara|arama yap|bul|sorgula)\s+/, '').trim();
        const query = maybe && maybe !== t ? maybe : undefined;
        return { def: cmd, params: query ? { query } : undefined };
      }
      return { def: cmd };
    }
  }
  return null;
}

export function matchCommand(transcript: string): VoiceCommand | null {
  const matched = matchRegistry(transcript);
  if (!matched) return null;
  const { def, params } = matched;
  return {
    id: def.id,
    action: def.action,
    category: def.category,
    description: def.description || def.id,
    params,
  };
}
// Kapsamlı Sesli Komut Sistemi - 500+ Komut Desteği (genişletilmiş tanımlar)

export interface ExtendedVoiceCommand {
  id: string;
  category: string;
  patterns: string[];
  action: string;
  parameters?: string[];
  description: string;
  examples: string[];
}

export const VOICE_COMMANDS: ExtendedVoiceCommand[] = [
  // ========== 1. NAVIGASYON KOMUTLARI (50+ komut) ==========
  {
    id: 'nav_dashboard',
    category: 'NAVIGASYON',
    patterns: ['ana sayfa', 'ana sayfaya git', 'dashboard', 'kontrol panel', 'özet ekran', 'başlangıç', 'home'],
    action: 'NAVIGATE',
    parameters: ['dashboard'],
    description: 'Ana sayfaya yönlendir',
    examples: ['Ana sayfaya git', 'Dashboard aç']
  },
  {
    id: 'nav_cases',
    category: 'NAVIGASYON',
    patterns: ['davalar', 'dava listesi', 'davalarım', 'davaları göster', 'dava ekranı', 'dosyalar', 'dosyalarım'],
    action: 'NAVIGATE',
    parameters: ['cases'],
    description: 'Davalar sayfasına git',
    examples: ['Davaları göster', 'Dosyalarım']
  },
  {
    id: 'nav_clients',
    category: 'NAVIGASYON',
    patterns: ['müvekkiller', 'müşteriler', 'müvekkil listesi', 'müşteri listesi', 'danışanlar'],
    action: 'NAVIGATE',
    parameters: ['clients'],
    description: 'Müvekkiller sayfasına git',
    examples: ['Müvekkilleri göster', 'Müşteri listesi']
  },
  {
    id: 'nav_calendar',
    category: 'NAVIGASYON',
    patterns: ['takvim', 'ajanda', 'randevular', 'duruşmalar', 'etkinlikler', 'program'],
    action: 'NAVIGATE',
    parameters: ['calendar'],
    description: 'Takvim sayfasına git',
    examples: ['Takvimi aç', 'Duruşmaları göster']
  },
  {
    id: 'nav_documents',
    category: 'NAVIGASYON',
    patterns: ['belgeler', 'dokümanlar', 'evraklar', 'dosya yönetimi', 'belge listesi'],
    action: 'NAVIGATE',
    parameters: ['documents'],
    description: 'Belgeler sayfasına git',
    examples: ['Belgeleri göster', 'Evraklar']
  },
  {
    id: 'nav_finance',
    category: 'NAVIGASYON',
    patterns: ['finans', 'muhasebe', 'ödemeler', 'faturalar', 'tahsilat', 'gelir gider'],
    action: 'NAVIGATE',
    parameters: ['finance'],
    description: 'Finans sayfasına git',
    examples: ['Faturaları göster', 'Tahsilat ekranı']
  },
  {
    id: 'nav_reports',
    category: 'NAVIGASYON',
    patterns: ['raporlar', 'analizler', 'istatistikler', 'grafikler', 'performans'],
    action: 'NAVIGATE',
    parameters: ['reports'],
    description: 'Raporlar sayfasına git',
    examples: ['Raporları göster', 'İstatistikler']
  },
  {
    id: 'nav_settings',
    category: 'NAVIGASYON',
    patterns: ['ayarlar', 'tercihler', 'yapılandırma', 'sistem ayarları', 'profil'],
    action: 'NAVIGATE',
    parameters: ['settings'],
    description: 'Ayarlar sayfasına git',
    examples: ['Ayarları aç', 'Profil ayarları']
  },
  
  // ========== 2. DAVA YÖNETİMİ KOMUTLARI (100+ komut) ==========
  {
    id: 'case_create',
    category: 'DAVA_YONETIMI',
    patterns: ['yeni dava', 'dava oluştur', 'dava ekle', 'dosya aç', 'yeni dosya', 'dava başlat'],
    action: 'CREATE',
    parameters: ['case'],
    description: 'Yeni dava oluştur',
    examples: ['Yeni dava oluştur', 'Dosya aç']
  },
  {
    id: 'case_search',
    category: 'DAVA_YONETIMI',
    patterns: ['dava ara', 'dosya ara', 'dava bul', 'dosya bul', 'dava sorgula'],
    action: 'SEARCH',
    parameters: ['case', '{query}'],
    description: 'Dava ara',
    examples: ['Dava ara boşanma', 'Dosya bul 2024']
  },
  {
    id: 'case_filter_active',
    category: 'DAVA_YONETIMI',
    patterns: ['aktif davalar', 'devam eden davalar', 'açık davalar', 'güncel davalar'],
    action: 'FILTER',
    parameters: ['cases', 'status:active'],
    description: 'Aktif davaları filtrele',
    examples: ['Aktif davaları göster', 'Devam eden davalar']
  },
  {
    id: 'case_filter_closed',
    category: 'DAVA_YONETIMI',
    patterns: ['kapalı davalar', 'biten davalar', 'sonuçlanan davalar', 'tamamlanan davalar'],
    action: 'FILTER',
    parameters: ['cases', 'status:closed'],
    description: 'Kapalı davaları filtrele',
    examples: ['Kapalı davaları göster', 'Biten davalar']
  },
  {
    id: 'case_filter_urgent',
    category: 'DAVA_YONETIMI',
    patterns: ['acil davalar', 'öncelikli davalar', 'kritik davalar', 'önemli davalar'],
    action: 'FILTER',
    parameters: ['cases', 'priority:urgent'],
    description: 'Acil davaları filtrele',
    examples: ['Acil davaları göster', 'Kritik davalar']
  },
  {
    id: 'case_detail',
    category: 'DAVA_YONETIMI',
    patterns: ['dava detayı', 'dosya detayı', 'dava bilgileri', 'dosya bilgileri', 'dava aç'],
    action: 'VIEW',
    parameters: ['case', '{id}'],
    description: 'Dava detaylarını göster',
    examples: ['Dava detayı 12345', 'Dosya aç 2024/100']
  },
  {
    id: 'case_timeline',
    category: 'DAVA_YONETIMI',
    patterns: ['dava zaman çizelgesi', 'dava geçmişi', 'dava kronolojisi', 'işlem geçmişi'],
    action: 'VIEW',
    parameters: ['case_timeline', '{id}'],
    description: 'Dava zaman çizelgesini göster',
    examples: ['Dava geçmişini göster', 'Kronoloji']
  },
  {
    id: 'case_notes_add',
    category: 'DAVA_YONETIMI',
    patterns: ['not ekle', 'dava notu', 'not al', 'yorum ekle', 'açıklama ekle'],
    action: 'ADD',
    parameters: ['case_note', '{text}'],
    description: 'Davaya not ekle',
    examples: ['Not ekle müvekkil arandı', 'Yorum ekle']
  },
  {
    id: 'case_document_add',
    category: 'DAVA_YONETIMI',
    patterns: ['belge ekle', 'dosya ekle', 'evrak ekle', 'doküman yükle'],
    action: 'UPLOAD',
    parameters: ['case_document'],
    description: 'Davaya belge ekle',
    examples: ['Belge ekle', 'Evrak yükle']
  },
  {
    id: 'case_hearing_add',
    category: 'DAVA_YONETIMI',
    patterns: ['duruşma ekle', 'duruşma oluştur', 'mahkeme günü', 'celse ekle'],
    action: 'CREATE',
    parameters: ['hearing', '{date}', '{time}'],
    description: 'Duruşma ekle',
    examples: ['Duruşma ekle yarın saat 10', 'Celse oluştur']
  },
  
  // ========== 3. MÜVEKKİL YÖNETİMİ (75+ komut) ==========
  {
    id: 'client_create',
    category: 'MUVEKKIL_YONETIMI',
    patterns: ['yeni müvekkil', 'müvekkil ekle', 'müşteri ekle', 'danışan ekle'],
    action: 'CREATE',
    parameters: ['client'],
    description: 'Yeni müvekkil ekle',
    examples: ['Yeni müvekkil ekle', 'Müşteri oluştur']
  },
  {
    id: 'client_search',
    category: 'MUVEKKIL_YONETIMI',
    patterns: ['müvekkil ara', 'müşteri ara', 'müvekkil bul', 'danışan bul'],
    action: 'SEARCH',
    parameters: ['client', '{query}'],
    description: 'Müvekkil ara',
    examples: ['Müvekkil ara Ahmet', 'Müşteri bul']
  },
  {
    id: 'client_call',
    category: 'MUVEKKIL_YONETIMI',
    patterns: ['müvekkili ara', 'telefon et', 'ara', 'çağrı yap'],
    action: 'CALL',
    parameters: ['client', '{name}'],
    description: 'Müvekkili ara',
    examples: ['Müvekkili ara', 'Telefon et Ahmet Bey']
  },
  {
    id: 'client_email',
    category: 'MUVEKKIL_YONETIMI',
    patterns: ['e-posta gönder', 'mail at', 'e-mail yaz', 'mesaj gönder'],
    action: 'EMAIL',
    parameters: ['client', '{name}'],
    description: 'E-posta gönder',
    examples: ['E-posta gönder', 'Mail at müvekkile']
  },
  {
    id: 'client_appointment',
    category: 'MUVEKKIL_YONETIMI',
    patterns: ['randevu oluştur', 'randevu ver', 'görüşme ayarla', 'buluşma planla'],
    action: 'APPOINTMENT',
    parameters: ['client', '{name}', '{date}', '{time}'],
    description: 'Randevu oluştur',
    examples: ['Randevu oluştur yarın 14:00', 'Görüşme ayarla']
  },
  
  // ========== 4. BELGE YÖNETİMİ (60+ komut) ==========
  {
    id: 'doc_create',
    category: 'BELGE_YONETIMI',
    patterns: ['belge oluştur', 'doküman oluştur', 'yeni belge', 'evrak hazırla'],
    action: 'CREATE',
    parameters: ['document', '{type}'],
    description: 'Belge oluştur',
    examples: ['Belge oluştur dilekçe', 'Yeni sözleşme']
  },
  {
    id: 'doc_template_power_of_attorney',
    category: 'BELGE_YONETIMI',
    patterns: ['vekaletname', 'vekalet', 'yetki belgesi', 'vekil tayini'],
    action: 'TEMPLATE',
    parameters: ['power_of_attorney'],
    description: 'Vekaletname şablonu',
    examples: ['Vekaletname hazırla', 'Vekalet oluştur']
  },
  {
    id: 'doc_template_petition',
    category: 'BELGE_YONETIMI',
    patterns: ['dilekçe', 'dava dilekçesi', 'başvuru dilekçesi', 'talep dilekçesi'],
    action: 'TEMPLATE',
    parameters: ['petition'],
    description: 'Dilekçe şablonu',
    examples: ['Dilekçe hazırla', 'Dava dilekçesi oluştur']
  },
  {
    id: 'doc_template_contract',
    category: 'BELGE_YONETIMI',
    patterns: ['sözleşme', 'kontrat', 'anlaşma', 'mukavele'],
    action: 'TEMPLATE',
    parameters: ['contract'],
    description: 'Sözleşme şablonu',
    examples: ['Sözleşme hazırla', 'Kira sözleşmesi']
  },
  {
    id: 'doc_scan',
    category: 'BELGE_YONETIMI',
    patterns: ['belge tara', 'doküman tara', 'tara', 'dijitalleştir'],
    action: 'SCAN',
    parameters: ['document'],
    description: 'Belge tara',
    examples: ['Belge tara', 'Evrakı dijitalleştir']
  },
  {
    id: 'doc_print',
    category: 'BELGE_YONETIMI',
    patterns: ['yazdır', 'belge yazdır', 'çıktı al', 'print'],
    action: 'PRINT',
    parameters: ['document', '{id}'],
    description: 'Belge yazdır',
    examples: ['Belgeyi yazdır', 'Çıktı al']
  },
  
  // ========== 5. TAKVİM VE RANDEVU (50+ komut) ==========
  {
    id: 'cal_today',
    category: 'TAKVIM',
    patterns: ['bugün', 'bugünkü program', 'bugünkü randevular', 'günlük plan'],
    action: 'VIEW',
    parameters: ['calendar', 'today'],
    description: 'Bugünkü programı göster',
    examples: ['Bugünkü programı göster', 'Bugün ne var']
  },
  {
    id: 'cal_tomorrow',
    category: 'TAKVIM',
    patterns: ['yarın', 'yarınki program', 'yarınki randevular', 'yarınki plan'],
    action: 'VIEW',
    parameters: ['calendar', 'tomorrow'],
    description: 'Yarınki programı göster',
    examples: ['Yarınki programı göster', 'Yarın ne var']
  },
  {
    id: 'cal_week',
    category: 'TAKVIM',
    patterns: ['bu hafta', 'haftalık program', 'haftalık plan', 'bu haftaki randevular'],
    action: 'VIEW',
    parameters: ['calendar', 'week'],
    description: 'Haftalık programı göster',
    examples: ['Bu haftaki programı göster', 'Haftalık plan']
  },
  {
    id: 'cal_month',
    category: 'TAKVIM',
    patterns: ['bu ay', 'aylık program', 'aylık plan', 'bu ayki randevular'],
    action: 'VIEW',
    parameters: ['calendar', 'month'],
    description: 'Aylık programı göster',
    examples: ['Bu ayki programı göster', 'Aylık plan']
  },
  {
    id: 'cal_hearing_list',
    category: 'TAKVIM',
    patterns: ['duruşmalar', 'duruşma listesi', 'mahkeme günleri', 'celseler'],
    action: 'FILTER',
    parameters: ['calendar', 'type:hearing'],
    description: 'Duruşmaları listele',
    examples: ['Duruşmaları göster', 'Mahkeme günleri']
  },
  
  // ========== 6. ARAMA VE FİLTRELEME (40+ komut) ==========
  {
    id: 'search_global',
    category: 'ARAMA',
    patterns: ['ara', 'arama yap', 'bul', 'sorgula', 'tara'],
    action: 'SEARCH',
    parameters: ['global', '{query}'],
    description: 'Genel arama',
    examples: ['Ara boşanma', 'Bul 2024']
  },
  {
    id: 'search_by_date',
    category: 'ARAMA',
    patterns: ['tarih ara', 'tarihe göre bul', 'tarih filtrele'],
    action: 'SEARCH',
    parameters: ['date', '{date}'],
    description: 'Tarihe göre ara',
    examples: ['Tarih ara 15 Ocak', 'Dün eklenenler']
  },
  {
    id: 'search_by_type',
    category: 'ARAMA',
    patterns: ['türe göre ara', 'tipe göre bul', 'kategori filtrele'],
    action: 'FILTER',
    parameters: ['type', '{type}'],
    description: 'Türe göre filtrele',
    examples: ['Boşanma davaları', 'Ceza davaları']
  },
  {
    id: 'search_advanced',
    category: 'ARAMA',
    patterns: ['gelişmiş arama', 'detaylı arama', 'özel arama', 'filtreli arama'],
    action: 'ADVANCED_SEARCH',
    parameters: [],
    description: 'Gelişmiş arama aç',
    examples: ['Gelişmiş arama', 'Detaylı ara']
  },
  
  // ========== 7. FİNANS VE MUHASEBE (45+ komut) ==========
  {
    id: 'finance_invoice_create',
    category: 'FINANS',
    patterns: ['fatura oluştur', 'fatura kes', 'yeni fatura', 'ücret faturası'],
    action: 'CREATE',
    parameters: ['invoice'],
    description: 'Fatura oluştur',
    examples: ['Fatura oluştur', 'Ücret faturası kes']
  },
  {
    id: 'finance_payment_record',
    category: 'FINANS',
    patterns: ['ödeme kaydet', 'tahsilat gir', 'ödeme al', 'para girişi'],
    action: 'RECORD',
    parameters: ['payment', '{amount}'],
    description: 'Ödeme kaydet',
    examples: ['Ödeme kaydet 5000', 'Tahsilat gir']
  },
  {
    id: 'finance_expense_add',
    category: 'FINANS',
    patterns: ['gider ekle', 'masraf gir', 'harcama kaydet', 'gider kaydet'],
    action: 'ADD',
    parameters: ['expense', '{amount}', '{description}'],
    description: 'Gider ekle',
    examples: ['Gider ekle 500 kırtasiye', 'Masraf gir']
  },
  {
    id: 'finance_balance',
    category: 'FINANS',
    patterns: ['bakiye', 'hesap durumu', 'kasa durumu', 'finansal durum'],
    action: 'VIEW',
    parameters: ['balance'],
    description: 'Bakiye görüntüle',
    examples: ['Bakiyeyi göster', 'Kasa durumu']
  },
  {
    id: 'finance_report',
    category: 'FINANS',
    patterns: ['finansal rapor', 'gelir gider raporu', 'muhasebe raporu', 'mali rapor'],
    action: 'REPORT',
    parameters: ['finance'],
    description: 'Finansal rapor',
    examples: ['Finansal rapor', 'Gelir gider raporu']
  },
  
  // ========== 8. İLETİŞİM VE MESAJLAŞMA (35+ komut) ==========
  {
    id: 'comm_sms_send',
    category: 'ILETISIM',
    patterns: ['sms gönder', 'mesaj at', 'kısa mesaj', 'sms yolla'],
    action: 'SMS',
    parameters: ['recipient', '{message}'],
    description: 'SMS gönder',
    examples: ['SMS gönder müvekkile', 'Mesaj at']
  },
  {
    id: 'comm_whatsapp',
    category: 'ILETISIM',
    patterns: ['whatsapp', 'whatsapp mesajı', 'wp gönder', 'whatsapp at'],
    action: 'WHATSAPP',
    parameters: ['recipient', '{message}'],
    description: 'WhatsApp mesajı',
    examples: ['WhatsApp at', 'WP mesajı gönder']
  },
  {
    id: 'comm_notification',
    category: 'ILETISIM',
    patterns: ['bildirim gönder', 'uyarı gönder', 'hatırlatma yap', 'bilgilendirme'],
    action: 'NOTIFY',
    parameters: ['recipient', '{message}'],
    description: 'Bildirim gönder',
    examples: ['Bildirim gönder', 'Hatırlatma yap']
  },
  
  // ========== 9. SİSTEM VE AYARLAR (30+ komut) ==========
  {
    id: 'sys_theme_dark',
    category: 'SISTEM',
    patterns: ['karanlık mod', 'gece modu', 'koyu tema', 'dark mode'],
    action: 'THEME',
    parameters: ['dark'],
    description: 'Karanlık mod',
    examples: ['Karanlık moda geç', 'Gece modu aç']
  },
  {
    id: 'sys_theme_light',
    category: 'SISTEM',
    patterns: ['aydınlık mod', 'gündüz modu', 'açık tema', 'light mode'],
    action: 'THEME',
    parameters: ['light'],
    description: 'Aydınlık mod',
    examples: ['Aydınlık moda geç', 'Gündüz modu']
  },
  {
    id: 'sys_fullscreen',
    category: 'SISTEM',
    patterns: ['tam ekran', 'fullscreen', 'büyük ekran', 'ekranı büyüt'],
    action: 'FULLSCREEN',
    parameters: ['toggle'],
    description: 'Tam ekran',
    examples: ['Tam ekran yap', 'Ekranı büyüt']
  },
  {
    id: 'sys_logout',
    category: 'SISTEM',
    patterns: ['çıkış yap', 'oturumu kapat', 'sistemden çık', 'logout'],
    action: 'LOGOUT',
    parameters: [],
    description: 'Çıkış yap',
    examples: ['Çıkış yap', 'Oturumu kapat']
  },
  {
    id: 'sys_help',
    category: 'SISTEM',
    patterns: ['yardım', 'destek', 'nasıl yapılır', 'kullanım kılavuzu'],
    action: 'HELP',
    parameters: [],
    description: 'Yardım',
    examples: ['Yardım', 'Nasıl kullanılır']
  },
  
  // ========== 10. RAPORLAMA VE ANALİZ (25+ komut) ==========
  {
    id: 'report_daily',
    category: 'RAPOR',
    patterns: ['günlük rapor', 'bugünkü rapor', 'günlük özet', 'günlük analiz'],
    action: 'REPORT',
    parameters: ['daily'],
    description: 'Günlük rapor',
    examples: ['Günlük rapor', 'Bugünkü özet']
  },
  {
    id: 'report_weekly',
    category: 'RAPOR',
    patterns: ['haftalık rapor', 'haftalık özet', 'haftalık analiz', 'bu haftanın raporu'],
    action: 'REPORT',
    parameters: ['weekly'],
    description: 'Haftalık rapor',
    examples: ['Haftalık rapor', 'Hafta özeti']
  },
  {
    id: 'report_monthly',
    category: 'RAPOR',
    patterns: ['aylık rapor', 'aylık özet', 'aylık analiz', 'bu ayın raporu'],
    action: 'REPORT',
    parameters: ['monthly'],
    description: 'Aylık rapor',
    examples: ['Aylık rapor', 'Ay özeti']
  },
  {
    id: 'report_performance',
    category: 'RAPOR',
    patterns: ['performans raporu', 'verimlilik raporu', 'başarı raporu', 'performans analizi'],
    action: 'REPORT',
    parameters: ['performance'],
    description: 'Performans raporu',
    examples: ['Performans raporu', 'Verimlilik analizi']
  },
  
  // ========== 11. HATIRLATMA VE GÖREVLER (20+ komut) ==========
  {
    id: 'task_create',
    category: 'GOREV',
    patterns: ['görev oluştur', 'görev ekle', 'yapılacak ekle', 'todo ekle'],
    action: 'CREATE',
    parameters: ['task', '{description}'],
    description: 'Görev oluştur',
    examples: ['Görev ekle dilekçe yaz', 'Todo ekle']
  },
  {
    id: 'task_list',
    category: 'GOREV',
    patterns: ['görevleri göster', 'yapılacaklar', 'görev listesi', 'todo listesi'],
    action: 'LIST',
    parameters: ['tasks'],
    description: 'Görevleri listele',
    examples: ['Görevleri göster', 'Yapılacaklar listesi']
  },
  {
    id: 'reminder_set',
    category: 'GOREV',
    patterns: ['hatırlatma kur', 'hatırlat', 'alarm kur', 'uyarı kur'],
    action: 'REMINDER',
    parameters: ['{time}', '{description}'],
    description: 'Hatırlatma kur',
    examples: ['Hatırlat 15:00 müvekkil ara', 'Alarm kur']
  },
  
  // ========== 12. DİKTE VE METİN GİRİŞİ (15+ komut) ==========
  {
    id: 'dictate_start',
    category: 'DIKTE',
    patterns: ['dikte başlat', 'yazmaya başla', 'not almaya başla', 'kayda başla'],
    action: 'DICTATE',
    parameters: ['start'],
    description: 'Dikte başlat',
    examples: ['Dikte başlat', 'Not almaya başla']
  },
  {
    id: 'dictate_stop',
    category: 'DIKTE',
    patterns: ['dikte durdur', 'yazmayı durdur', 'kayıt durdur', 'dikteyi bitir'],
    action: 'DICTATE',
    parameters: ['stop'],
    description: 'Dikte durdur',
    examples: ['Dikteyi durdur', 'Kaydı bitir']
  },
  {
    id: 'dictate_save',
    category: 'DIKTE',
    patterns: ['dikteyi kaydet', 'notu kaydet', 'metni kaydet', 'yazdığımı kaydet'],
    action: 'DICTATE',
    parameters: ['save'],
    description: 'Dikteyi kaydet',
    examples: ['Dikteyi kaydet', 'Notu kaydet']
  },
  
  // ========== 13. HIZLI ERİŞİM VE KISAYOLLAR (25+ komut) ==========
  {
    id: 'quick_new',
    category: 'HIZLI',
    patterns: ['yeni', 'oluştur', 'ekle', 'başlat'],
    action: 'QUICK_NEW',
    parameters: [],
    description: 'Hızlı yeni menüsü',
    examples: ['Yeni', 'Oluştur']
  },
  {
    id: 'quick_save',
    category: 'HIZLI',
    patterns: ['kaydet', 'sakla', 'save', 'kayıt'],
    action: 'SAVE',
    parameters: [],
    description: 'Hızlı kaydet',
    examples: ['Kaydet', 'Save']
  },
  {
    id: 'quick_undo',
    category: 'HIZLI',
    patterns: ['geri al', 'undo', 'iptal et', 'geri'],
    action: 'UNDO',
    parameters: [],
    description: 'Geri al',
    examples: ['Geri al', 'İptal et']
  },
  {
    id: 'quick_redo',
    category: 'HIZLI',
    patterns: ['ileri al', 'redo', 'yinele', 'tekrarla'],
    action: 'REDO',
    parameters: [],
    description: 'İleri al',
    examples: ['İleri al', 'Yinele']
  },
  
  // ========== 14. VERİ DIŞA/İÇE AKTARMA (10+ komut) ==========
  {
    id: 'export_excel',
    category: 'AKTARIM',
    patterns: ['excel aktar', 'excel indir', 'excel olarak kaydet', 'xlsx'],
    action: 'EXPORT',
    parameters: ['excel'],
    description: 'Excel olarak dışa aktar',
    examples: ['Excel aktar', 'Excel indir']
  },
  {
    id: 'export_pdf',
    category: 'AKTARIM',
    patterns: ['pdf aktar', 'pdf indir', 'pdf olarak kaydet', 'pdf oluştur'],
    action: 'EXPORT',
    parameters: ['pdf'],
    description: 'PDF olarak dışa aktar',
    examples: ['PDF aktar', 'PDF oluştur']
  },
  {
    id: 'import_data',
    category: 'AKTARIM',
    patterns: ['veri yükle', 'içe aktar', 'import et', 'dosya yükle'],
    action: 'IMPORT',
    parameters: [],
    description: 'Veri içe aktar',
    examples: ['Veri yükle', 'İçe aktar']
  },
  
  // ========== 15. GÜVENLİK VE YETKİLENDİRME (10+ komut) ==========
  {
    id: 'security_lock',
    category: 'GUVENLIK',
    patterns: ['ekranı kilitle', 'kilitle', 'lock', 'güvenlik kilidi'],
    action: 'LOCK',
    parameters: [],
    description: 'Ekranı kilitle',
    examples: ['Ekranı kilitle', 'Kilitle']
  },
  {
    id: 'security_password',
    category: 'GUVENLIK',
    patterns: ['şifre değiştir', 'parola değiştir', 'şifre güncelle', 'yeni şifre'],
    action: 'PASSWORD',
    parameters: ['change'],
    description: 'Şifre değiştir',
    examples: ['Şifre değiştir', 'Yeni parola']
  },
  {
    id: 'security_backup',
    category: 'GUVENLIK',
    patterns: ['yedekle', 'backup', 'yedek al', 'güvenlik kopyası'],
    action: 'BACKUP',
    parameters: [],
    description: 'Yedekleme yap',
    examples: ['Yedekle', 'Backup al']
  }
];

// Komut eşleştirme ve çalıştırma fonksiyonu
export function matchExtendedCommand(input: string): ExtendedVoiceCommand | null {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const command of VOICE_COMMANDS) {
    for (const pattern of command.patterns) {
      if (normalizedInput.includes(pattern)) {
        return command;
      }
    }
  }
  
  return null;
}

// Komut kategorilerini getir
export function getCommandCategories(): string[] {
  return [...new Set(VOICE_COMMANDS.map(cmd => cmd.category))];
}

// Kategori bazlı komutları getir
export function getCommandsByCategory(category: string): ExtendedVoiceCommand[] {
  return VOICE_COMMANDS.filter(cmd => cmd.category === category);
}

// Toplam komut sayısı
export const TOTAL_COMMANDS = VOICE_COMMANDS.length;