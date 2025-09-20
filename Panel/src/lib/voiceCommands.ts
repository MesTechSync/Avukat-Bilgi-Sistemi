// Central command registry for voice control
// Lightweight patterns with synonyms to scale beyond 500 natural variants

export type CommandAction =
  | 'NAV_DASHBOARD'
  | 'NAV_CASES'
  | 'NAV_CLIENTS'
  | 'NAV_APPOINTMENTS'
  | 'NAV_SETTINGS'
  | 'NAV_AI_ASSISTANT'
  | 'NAV_SEARCH'
  | 'NAV_CONTRACT_GENERATOR'
  | 'NAV_PETITION_WRITER'
  | 'NAV_WHATSAPP'
  | 'NAV_FILE_CONVERTER'
  | 'NAV_FINANCIALS'
  | 'NAV_PROFILE'
  | 'SEARCH'
  | 'DARK_MODE'
  | 'LIGHT_MODE'
  | 'DICTATE_START'
  | 'DICTATE_STOP'
  | 'DICTATE_SAVE'
  | 'VOICE_START'
  | 'VOICE_STOP'
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
  cases: syn(['davalar', 'dava yönetimi', 'dava yönetim', 'dava dosyaları', 'dosyalar', 'dava ekranı']),
  clients: syn(['müvekkiller', 'müvekkil yönetimi', 'müvekkil yönetim', 'müvekkil listesi', 'müşteriler', 'müşteri yönetimi', 'danışanlar']),
  appointments: syn(['randevu', 'randevular', 'randevu yönetimi', 'randevular yönetimi', 'randevu ekranı', 'takvim', 'ajanda', 'duruşmalar']),
  settings: syn(['ayarlar', 'sistem ayarları', 'tercihler', 'profil ayarları']),
  ai: syn(['ai hukuki asistan', 'yapay zeka asistan', 'asistan']),
  searchPage: syn(['içtihat', 'içtihat arama', 'içtihat araştırma', 'arama sayfası', 'içtihatlar']),
  petition: syn(['dilekçe yazım', 'dilekçe oluştur', 'dilekçe yaz']),
  contract: syn(['sözleşme oluştur', 'sözleşme sihirbazı', 'sözleşme üretici']),
  whatsapp: syn(['whatsapp', 'whatsapp destek']),
  fileconv: syn(['dosya dönüştürücü', 'dosya çevirici', 'format dönüştürme']),
  financials: syn(['mali işler', 'finans', 'muhasebe', 'ödemeler', 'faturalar']),
  profile: syn(['hesabım', 'profilim', 'profil']),
  search: syn(['ara', 'arama yap', 'bul', 'sorgula']),
  dark: syn(['karanlık mod', 'gece modu', 'koyu tema']),
  light: syn(['aydınlık mod', 'gündüz modu', 'açık tema']),
  dictateStart: syn(['dikte başlat', 'yazmaya başla', 'not almaya başla']),
  dictateStop: syn(['dikte durdur', 'yazmayı durdur', 'kaydı bitir']),
  dictateSave: syn(['dikteyi kaydet', 'notu kaydet', 'metni kaydet']),
  voiceStart: syn(['ses tanımayı başlat', 'ses tanımayı aç', 'sesi aç', 'dinlemeyi başlat']),
  voiceStop: syn(['ses tanımayı durdur', 'ses tanımayı kapat', 'sesi kapat', 'dinlemeyi durdur']),
};

export const COMMANDS: CommandDef[] = [
  // Navigation
  { id: 'nav_dashboard', category: 'NAVIGASYON', action: 'NAV_DASHBOARD', patterns: s.home, description: 'Ana sayfaya git' },
  { id: 'nav_cases', category: 'NAVIGASYON', action: 'NAV_CASES', patterns: s.cases, description: 'Davalar sayfasına git' },
  { id: 'nav_clients', category: 'NAVIGASYON', action: 'NAV_CLIENTS', patterns: s.clients, description: 'Müvekkiller sayfasına git' },
  { id: 'nav_appointments', category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', patterns: s.appointments, description: 'Randevular sayfasına git' },
  { id: 'nav_settings', category: 'NAVIGASYON', action: 'NAV_SETTINGS', patterns: s.settings, description: 'Ayarlar sayfasına git' },
  { id: 'nav_ai', category: 'NAVIGASYON', action: 'NAV_AI_ASSISTANT', patterns: s.ai, description: 'AI Asistanına git' },
  { id: 'nav_search_page', category: 'NAVIGASYON', action: 'NAV_SEARCH', patterns: s.searchPage, description: 'Arama sayfasına git' },
  { id: 'nav_petition', category: 'NAVIGASYON', action: 'NAV_PETITION_WRITER', patterns: s.petition, description: 'Dilekçe yazım sayfasına git' },
  { id: 'nav_contract', category: 'NAVIGASYON', action: 'NAV_CONTRACT_GENERATOR', patterns: s.contract, description: 'Sözleşme oluşturucuya git' },
  { id: 'nav_whatsapp', category: 'NAVIGASYON', action: 'NAV_WHATSAPP', patterns: s.whatsapp, description: 'WhatsApp entegrasyonuna git' },
  { id: 'nav_fileconv', category: 'NAVIGASYON', action: 'NAV_FILE_CONVERTER', patterns: s.fileconv, description: 'Dosya dönüştürücüye git' },
  { id: 'nav_financials', category: 'NAVIGASYON', action: 'NAV_FINANCIALS', patterns: s.financials, description: 'Mali İşler sayfasına git' },
  { id: 'nav_profile', category: 'NAVIGASYON', action: 'NAV_PROFILE', patterns: s.profile, description: 'Hesabım sayfasına git' },

  // Appearance
  { id: 'view_dark', category: 'GORUNUM', action: 'DARK_MODE', patterns: s.dark, description: 'Karanlık modu aç' },
  { id: 'view_light', category: 'GORUNUM', action: 'LIGHT_MODE', patterns: s.light, description: 'Aydınlık modu aç' },

  // Search
  { id: 'search_global', category: 'ARAMA_SORGULAMA', action: 'SEARCH', patterns: s.search, description: 'Genel arama yap' },

  // Dictation
  { id: 'dictate_start', category: 'DIKTE', action: 'DICTATE_START', patterns: s.dictateStart, description: 'Dikteyi başlat' },
  { id: 'dictate_stop', category: 'DIKTE', action: 'DICTATE_STOP', patterns: s.dictateStop, description: 'Dikteyi durdur' },
  { id: 'dictate_save', category: 'DIKTE', action: 'DICTATE_SAVE', patterns: s.dictateSave, description: 'Dikteyi kaydet' },

  // Voice engine control
  { id: 'voice_start', category: 'NAVIGASYON', action: 'VOICE_START', patterns: s.voiceStart, description: 'Ses tanımayı başlat' },
  { id: 'voice_stop', category: 'NAVIGASYON', action: 'VOICE_STOP', patterns: s.voiceStop, description: 'Ses tanımayı durdur' },
];

export interface VoiceCommand {
  id: string;
  action: CommandAction;
  category: CommandDef['category'];
  description: string;
  params?: Record<string, any>;
}

export function matchRegistry(transcript: string): { def: CommandDef; params?: Record<string, any> } | null {
  // Normalize a few common mishears for strict path (conservative)
  let t = transcript.toLowerCase().trim();
  // e.g., 'arax' -> 'ara' to enable strict SEARCH matching without enabling broad fuzzy
  t = t.replace(/\barax\b|\baray\b|\baro\b/g, 'ara');
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

// Extended commands interface
export interface ExtendedVoiceCommand {
  id: string;
  category: string;
  patterns: string[];
  action: string;
  parameters?: string[];
  description: string;
  examples: string[];
}

// Mevzuat_3 için genişletilmiş hukuki komutlar
export const VOICE_COMMANDS: ExtendedVoiceCommand[] = [
  // ========== NAVIGASYON KOMUTLARI ==========
  {
    id: 'nav_dashboard',
    category: 'NAVIGASYON',
    patterns: ['ana sayfa', 'ana sayfaya git', 'dashboard', 'kontrol paneli', 'özet ekran', 'başlangıç', 'home', 'karar ana sayfa', 'ana ekran', 'başlangıç sayfası'],
    action: 'NAVIGATE',
    parameters: ['dashboard'],
    description: 'Ana sayfaya yönlendir',
    examples: ['Ana sayfaya git', 'Dashboard aç', 'Karar ana sayfa']
  },
  {
    id: 'nav_ai_chat',
    category: 'NAVIGASYON',
    patterns: ['hukuk asistanı', 'ai asistan', 'yapay zeka', 'hukuki asistan', 'asistan', 'chat', 'soru sor'],
    action: 'NAVIGATE',
    parameters: ['ai-chat'],
    description: 'Hukuk Asistanına git',
    examples: ['Hukuk asistanı', 'AI asistan aç', 'Soru sor']
  },
  {
    id: 'nav_search',
    category: 'NAVIGASYON',
    patterns: ['içtihat arama', 'mevzuat arama', 'karar arama', 'hukuki arama', 'arama sayfası', 'içtihatlar', 'mevzuat', 'hukuki araştırma', 'yasal araştırma', 'hukuk araştırması'],
    action: 'NAVIGATE',
    parameters: ['search'],
    description: 'İçtihat & Mevzuat sayfasına git',
    examples: ['İçtihat arama', 'Mevzuat arama', 'Karar arama']
  },
  {
    id: 'nav_petition_writer',
    category: 'NAVIGASYON',
    patterns: ['dilekçe yazım', 'dilekçe oluştur', 'dilekçe hazırla', 'layiha yaz', 'dilekçe yaz'],
    action: 'NAVIGATE',
    parameters: ['petition-writer'],
    description: 'Dilekçe Yazım sayfasına git',
    examples: ['Dilekçe yazım', 'Dilekçe oluştur', 'Layiha hazırla']
  },
  {
    id: 'nav_contract_generator',
    category: 'NAVIGASYON',
    patterns: ['sözleşme oluştur', 'kontrat hazırla', 'sözleşme yaz', 'mukavele oluştur', 'anlaşma yap'],
    action: 'NAVIGATE',
    parameters: ['contract-generator'],
    description: 'Sözleşme Oluşturucuya git',
    examples: ['Sözleşme oluştur', 'Kontrat hazırla', 'Mukavele oluştur']
  },
  {
    id: 'nav_whatsapp',
    category: 'NAVIGASYON',
    patterns: ['whatsapp destek', 'whatsapp', 'wp destek', '7/24 destek', 'canlı destek'],
    action: 'NAVIGATE',
    parameters: ['whatsapp'],
    description: 'WhatsApp Destek sayfasına git',
    examples: ['WhatsApp destek', '7/24 destek', 'Canlı destek']
  },
  {
    id: 'nav_file_converter',
    category: 'NAVIGASYON',
    patterns: ['dosya dönüştürücü', 'format dönüştür', 'dosya çevir', 'belge dönüştür'],
    action: 'NAVIGATE',
    parameters: ['file-converter'],
    description: 'Dosya Dönüştürücüye git',
    examples: ['Dosya dönüştürücü', 'Format dönüştür', 'Belge çevir']
  },
  {
    id: 'nav_cases',
    category: 'NAVIGASYON',
    patterns: ['davalar', 'dava yönetimi', 'dava listesi', 'davalarım', 'dosyalar', 'dava ekranı', 'dava dosyaları'],
    action: 'NAVIGATE',
    parameters: ['cases'],
    description: 'Dava Yönetimi sayfasına git',
    examples: ['Davalar', 'Dava yönetimi', 'Dosyalarım']
  },
  {
    id: 'nav_clients',
    category: 'NAVIGASYON',
    patterns: ['müvekkiller', 'müvekkil yönetimi', 'müşteriler', 'danışanlar', 'müvekkil listesi'],
    action: 'NAVIGATE',
    parameters: ['clients'],
    description: 'Müvekkil Yönetimi sayfasına git',
    examples: ['Müvekkiller', 'Müvekkil yönetimi', 'Danışanlar']
  },
  {
    id: 'nav_appointments',
    category: 'NAVIGASYON',
    patterns: ['randevular', 'randevu yönetimi', 'takvim', 'ajanda', 'duruşmalar', 'program'],
    action: 'NAVIGATE',
    parameters: ['appointments'],
    description: 'Randevu Yönetimi sayfasına git',
    examples: ['Randevular', 'Takvim', 'Duruşmalar']
  },
  {
    id: 'nav_financials',
    category: 'NAVIGASYON',
    patterns: ['mali işler', 'finans', 'muhasebe', 'ödemeler', 'faturalar', 'tahsilat'],
    action: 'NAVIGATE',
    parameters: ['financials'],
    description: 'Mali İşler sayfasına git',
    examples: ['Mali işler', 'Finans', 'Faturalar']
  },
  {
    id: 'nav_settings',
    category: 'NAVIGASYON',
    patterns: ['ayarlar', 'sistem ayarları', 'tercihler', 'yapılandırma', 'profil ayarları'],
    action: 'NAVIGATE',
    parameters: ['settings'],
    description: 'Ayarlar sayfasına git',
    examples: ['Ayarlar', 'Sistem ayarları', 'Tercihler']
  },
  {
    id: 'nav_profile',
    category: 'NAVIGASYON',
    patterns: ['hesabım', 'profil', 'profilim', 'kullanıcı profili', 'hesap bilgileri'],
    action: 'NAVIGATE',
    parameters: ['profile'],
    description: 'Hesabım sayfasına git',
    examples: ['Hesabım', 'Profil', 'Kullanıcı profili']
  },
  {
    id: 'nav_notebook_llm',
    category: 'NAVIGASYON',
    patterns: ['notebook llm', 'notebook', 'llm', 'ai notebook', 'yapay zeka notebook', 'ai defter'],
    action: 'NAVIGATE',
    parameters: ['notebook-llm'],
    description: 'Notebook LLM sayfasına git',
    examples: ['Notebook LLM', 'AI Notebook', 'Yapay zeka notebook']
  },

  // ========== İÇTİHAT & MEVZUAT ALT KATEGORİLERİ ==========
  {
    id: 'search_yargitay',
    category: 'ARAMA_SORGULAMA',
    patterns: ['yargıtay ara', 'yargıtay kararı ara', 'yargıtay kararları', 'yargıtay içtihat', 'yargıtay emsal', 'yargıtay arama'],
    action: 'SEARCH',
    parameters: ['yargitay', '{query}'],
    description: 'Yargıtay kararlarını ara',
    examples: ['Yargıtay ara boşanma', 'Yargıtay kararı ara nafaka']
  },
  {
    id: 'search_danistay',
    category: 'ARAMA_SORGULAMA',
    patterns: ['danıştay ara', 'danıştay kararı ara', 'danıştay kararları', 'danıştay içtihat', 'danıştay emsal', 'danıştay arama'],
    action: 'SEARCH',
    parameters: ['danistay', '{query}'],
    description: 'Danıştay kararlarını ara',
    examples: ['Danıştay ara idari', 'Danıştay kararı ara vergi']
  },
  {
    id: 'search_emsal',
    category: 'ARAMA_SORGULAMA',
    patterns: ['emsal ara', 'emsal karar ara', 'emsal içtihat', 'emsal arama', 'uyap emsal', 'emsal kararları'],
    action: 'SEARCH',
    parameters: ['emsal', '{query}'],
    description: 'Emsal kararları ara',
    examples: ['Emsal ara tazminat', 'Emsal karar ara miras']
  },
  {
    id: 'search_bedesten',
    category: 'ARAMA_SORGULAMA',
    patterns: ['bedesten ara', 'bedesten arama', 'bedesten karar', 'bedesten içtihat', 'bedesten emsal'],
    action: 'SEARCH',
    parameters: ['bedesten', '{query}'],
    description: 'Bedesten birleşik arama',
    examples: ['Bedesten ara icra', 'Bedesten arama haciz']
  },
  {
    id: 'search_istinaf',
    category: 'ARAMA_SORGULAMA',
    patterns: ['istinaf ara', 'istinaf kararı ara', 'istinaf kararları', 'istinaf içtihat', 'istinaf arama'],
    action: 'SEARCH',
    parameters: ['istinaf', '{query}'],
    description: 'İstinaf kararlarını ara',
    examples: ['İstinaf ara ceza', 'İstinaf kararı ara hukuk']
  },
  {
    id: 'search_hukuk_mahkemesi',
    category: 'ARAMA_SORGULAMA',
    patterns: ['hukuk mahkemesi ara', 'hukuk mahkemesi kararı', 'hukuk mahkemesi içtihat', 'hukuk mahkemesi arama'],
    action: 'SEARCH',
    parameters: ['hukuk', '{query}'],
    description: 'Hukuk Mahkemeleri kararlarını ara',
    examples: ['Hukuk mahkemesi ara borç', 'Hukuk mahkemesi kararı ara alacak']
  },
  {
    id: 'search_mevzuat_kanun',
    category: 'ARAMA_SORGULAMA',
    patterns: ['kanun ara', 'kanun arama', 'mevzuat kanun', 'kanun metni ara', 'kanun maddesi ara'],
    action: 'SEARCH',
    parameters: ['mevzuat', 'kanun', '{query}'],
    description: 'Kanun metinlerini ara',
    examples: ['Kanun ara medeni', 'Kanun arama ticaret']
  },
  {
    id: 'search_mevzuat_yonetmelik',
    category: 'ARAMA_SORGULAMA',
    patterns: ['yönetmelik ara', 'yönetmelik arama', 'mevzuat yönetmelik', 'yönetmelik metni ara'],
    action: 'SEARCH',
    parameters: ['mevzuat', 'yonetmelik', '{query}'],
    description: 'Yönetmelik metinlerini ara',
    examples: ['Yönetmelik ara çevre', 'Yönetmelik arama iş güvenliği']
  },
  {
    id: 'search_mevzuat_kararname',
    category: 'ARAMA_SORGULAMA',
    patterns: ['kararname ara', 'kararname arama', 'mevzuat kararname', 'kararname metni ara'],
    action: 'SEARCH',
    parameters: ['mevzuat', 'kararname', '{query}'],
    description: 'Kararname metinlerini ara',
    examples: ['Kararname ara olağanüstü', 'Kararname arama acil']
  },
  {
    id: 'search_mevzuat_genelge',
    category: 'ARAMA_SORGULAMA',
    patterns: ['genelge ara', 'genelge arama', 'mevzuat genelge', 'genelge metni ara'],
    action: 'SEARCH',
    parameters: ['mevzuat', 'genelge', '{query}'],
    description: 'Genelge metinlerini ara',
    examples: ['Genelge ara maliye', 'Genelge arama sağlık']
  },

  // ========== AYARLAR ALT MENÜLERİ ==========
  {
    id: 'settings_profile',
    category: 'SISTEM',
    patterns: ['profil ayarları', 'profil düzenle', 'kişisel bilgiler', 'profil bilgileri', 'kullanıcı profili', 'hesap bilgileri'],
    action: 'SETTINGS_TAB',
    parameters: ['profile'],
    description: 'Profil ayarlarına git',
    examples: ['Profil ayarları', 'Kişisel bilgiler', 'Hesap bilgileri']
  },
  {
    id: 'settings_notifications',
    category: 'SISTEM',
    patterns: ['bildirim ayarları', 'bildirimler', 'uyarı ayarları', 'bildirim tercihleri', 'bildirim yönetimi'],
    action: 'SETTINGS_TAB',
    parameters: ['notifications'],
    description: 'Bildirim ayarlarına git',
    examples: ['Bildirim ayarları', 'Bildirimler', 'Uyarı ayarları']
  },
  {
    id: 'settings_security',
    category: 'SISTEM',
    patterns: ['güvenlik ayarları', 'güvenlik', 'şifre ayarları', 'güvenlik tercihleri', 'güvenlik yönetimi'],
    action: 'SETTINGS_TAB',
    parameters: ['security'],
    description: 'Güvenlik ayarlarına git',
    examples: ['Güvenlik ayarları', 'Güvenlik', 'Şifre ayarları']
  },
  {
    id: 'settings_appearance',
    category: 'SISTEM',
    patterns: ['görünüm ayarları', 'görünüm', 'tema ayarları', 'görsel ayarlar', 'arayüz ayarları'],
    action: 'SETTINGS_TAB',
    parameters: ['appearance'],
    description: 'Görünüm ayarlarına git',
    examples: ['Görünüm ayarları', 'Tema ayarları', 'Arayüz ayarları']
  },
  {
    id: 'settings_system',
    category: 'SISTEM',
    patterns: ['sistem ayarları', 'sistem', 'genel ayarlar', 'sistem tercihleri', 'sistem yönetimi'],
    action: 'SETTINGS_TAB',
    parameters: ['system'],
    description: 'Sistem ayarlarına git',
    examples: ['Sistem ayarları', 'Genel ayarlar', 'Sistem tercihleri']
  },
  {
    id: 'case_create',
    category: 'DAVA_YONETIMI',
    patterns: ['yeni dava', 'dava oluştur', 'dava ekle', 'dosya aç', 'yeni dosya', 'dava başlat'],
    action: 'CREATE_CASE',
    parameters: ['case'],
    description: 'Yeni dava oluştur',
    examples: ['Yeni dava', 'Dava oluştur', 'Dosya aç']
  },
  {
    id: 'case_search',
    category: 'DAVA_YONETIMI',
    patterns: ['dava ara', 'dosya ara', 'dava bul', 'dosya bul', 'dava sorgula'],
    action: 'SEARCH_CASE',
    parameters: ['case', '{query}'],
    description: 'Dava ara',
    examples: ['Dava ara boşanma', 'Dosya bul 2024', 'Dava sorgula nafaka']
  },
  {
    id: 'case_filter_active',
    category: 'DAVA_YONETIMI',
    patterns: ['aktif davalar', 'devam eden davalar', 'açık davalar', 'güncel davalar'],
    action: 'FILTER_CASE',
    parameters: ['cases', 'status:active'],
    description: 'Aktif davaları filtrele',
    examples: ['Aktif davalar', 'Devam eden davalar', 'Açık davalar']
  },
  {
    id: 'case_filter_closed',
    category: 'DAVA_YONETIMI',
    patterns: ['kapalı davalar', 'biten davalar', 'sonuçlanan davalar', 'tamamlanan davalar'],
    action: 'FILTER_CASE',
    parameters: ['cases', 'status:closed'],
    description: 'Kapalı davaları filtrele',
    examples: ['Kapalı davalar', 'Biten davalar', 'Sonuçlanan davalar']
  },

  // ========== BELGE İŞLEMLERİ KOMUTLARI ==========
  {
    id: 'document_create_petition',
    category: 'BELGE_ISLEMLERI',
    patterns: ['dilekçe yaz', 'dilekçe hazırla', 'layiha yaz', 'dilekçe oluştur'],
    action: 'CREATE_PETITION',
    parameters: ['petition'],
    description: 'Dilekçe oluştur',
    examples: ['Dilekçe yaz', 'Layiha hazırla', 'Dilekçe oluştur']
  },
  {
    id: 'document_create_contract',
    category: 'BELGE_ISLEMLERI',
    patterns: ['sözleşme yaz', 'kontrat hazırla', 'mukavele oluştur', 'anlaşma yap'],
    action: 'CREATE_CONTRACT',
    parameters: ['contract'],
    description: 'Sözleşme oluştur',
    examples: ['Sözleşme yaz', 'Kontrat hazırla', 'Mukavele oluştur']
  },
  {
    id: 'document_create_power_of_attorney',
    category: 'BELGE_ISLEMLERI',
    patterns: ['vekaletname', 'vekalet', 'yetki belgesi', 'vekil tayini'],
    action: 'CREATE_POWER_OF_ATTORNEY',
    parameters: ['power_of_attorney'],
    description: 'Vekaletname oluştur',
    examples: ['Vekaletname', 'Vekalet', 'Yetki belgesi']
  },

  // ========== MÜVEKKİL İŞLEMLERİ KOMUTLARI ==========
  {
    id: 'client_create',
    category: 'MUVEKKIL_ISLEMLERI',
    patterns: ['yeni müvekkil', 'müvekkil ekle', 'müşteri ekle', 'danışan ekle'],
    action: 'CREATE_CLIENT',
    parameters: ['client'],
    description: 'Yeni müvekkil ekle',
    examples: ['Yeni müvekkil', 'Müvekkil ekle', 'Danışan ekle']
  },
  {
    id: 'client_search',
    category: 'MUVEKKIL_ISLEMLERI',
    patterns: ['müvekkil ara', 'müşteri ara', 'müvekkil bul', 'danışan bul'],
    action: 'SEARCH_CLIENT',
    parameters: ['client', '{query}'],
    description: 'Müvekkil ara',
    examples: ['Müvekkil ara Ahmet', 'Müşteri bul', 'Danışan ara']
  },
  {
    id: 'client_call',
    category: 'MUVEKKIL_ISLEMLERI',
    patterns: ['müvekkili ara', 'telefon et', 'ara', 'çağrı yap'],
    action: 'CALL_CLIENT',
    parameters: ['client', '{name}'],
    description: 'Müvekkili ara',
    examples: ['Müvekkili ara', 'Telefon et', 'Çağrı yap']
  },

  // ========== TEMA VE GÖRÜNÜM KOMUTLARI ==========
  {
    id: 'sys_theme_dark',
    category: 'GORUNUM',
    patterns: ['karanlık mod', 'gece modu', 'koyu tema', 'dark mode', 'karanlık'],
    action: 'DARK_MODE',
    parameters: ['dark'],
    description: 'Karanlık mod',
    examples: ['Karanlık mod', 'Gece modu', 'Koyu tema']
  },
  {
    id: 'sys_theme_light',
    category: 'GORUNUM',
    patterns: ['aydınlık mod', 'gündüz modu', 'açık tema', 'light mode', 'aydınlık'],
    action: 'LIGHT_MODE',
    parameters: ['light'],
    description: 'Aydınlık mod',
    examples: ['Aydınlık mod', 'Gündüz modu', 'Açık tema']
  },

  // ========== DİKTE KOMUTLARI ==========
  {
    id: 'dictate_start',
    category: 'DİKTE',
    patterns: ['dikte başlat', 'dikteyi başlat', 'sesli yazım başlat', 'mikrofonu aç', 'konuşmaya başla', 'dikte modu'],
    action: 'DICTATE_START',
    parameters: [],
    description: 'Dikte modunu başlat',
    examples: ['Dikte başlat', 'Sesli yazım başlat', 'Mikrofonu aç']
  },
  {
    id: 'dictate_stop',
    category: 'DİKTE',
    patterns: ['dikte durdur', 'dikteyi durdur', 'sesli yazım durdur', 'mikrofonu kapat', 'konuşmayı durdur', 'dikte bitir'],
    action: 'DICTATE_STOP',
    parameters: [],
    description: 'Dikte modunu durdur',
    examples: ['Dikte durdur', 'Sesli yazım durdur', 'Mikrofonu kapat']
  },
  {
    id: 'dictate_save',
    category: 'DİKTE',
    patterns: ['dikteyi kaydet', 'dikte kaydet', 'sesli yazımı kaydet', 'metni kaydet', 'yazıyı kaydet'],
    action: 'DICTATE_SAVE',
    parameters: [],
    description: 'Dikte metnini kaydet',
    examples: ['Dikteyi kaydet', 'Metni kaydet', 'Yazıyı kaydet']
  },
  {
    id: 'dictate_clear',
    category: 'DİKTE',
    patterns: ['dikteyi temizle', 'dikte temizle', 'metni temizle', 'yazıyı sil', 'dikteyi sil'],
    action: 'DICTATE_CLEAR',
    parameters: [],
    description: 'Dikte metnini temizle',
    examples: ['Dikteyi temizle', 'Metni temizle', 'Yazıyı sil']
  },
  {
    id: 'dictate_start',
    category: 'DIKTE',
    patterns: ['dikte başlat', 'yazmaya başla', 'not almaya başla', 'kayda başla', 'dikte'],
    action: 'DICTATE_START',
    parameters: ['start'],
    description: 'Dikte başlat',
    examples: ['Dikte başlat', 'Not almaya başla', 'Yazmaya başla']
  },
  {
    id: 'dictate_stop',
    category: 'DIKTE',
    patterns: ['dikte durdur', 'yazmayı durdur', 'kayıt durdur', 'dikteyi bitir', 'dur'],
    action: 'DICTATE_STOP',
    parameters: ['stop'],
    description: 'Dikte durdur',
    examples: ['Dikte durdur', 'Yazmayı durdur', 'Kayıt durdur']
  },
  {
    id: 'dictate_save',
    category: 'DIKTE',
    patterns: ['dikteyi kaydet', 'notu kaydet', 'metni kaydet', 'yazdığımı kaydet', 'kaydet'],
    action: 'DICTATE_SAVE',
    parameters: ['save'],
    description: 'Dikteyi kaydet',
    examples: ['Dikteyi kaydet', 'Notu kaydet', 'Metni kaydet']
  },

  // ========== ÖZEL HEDEF DİKTE KOMUTLARI (ör. WhatsApp giriş kutusu) ==========
  {
    id: 'dictate_whatsapp',
    category: 'DİKTE',
    patterns: [
      'whatsapp barına yaz',
      'whatsapp mesaj yaz',
      'whatsapp kutusuna yaz',
      'mesaj kutusuna yaz',
      "whatsapp'a yaz",
      'whatsapp yazmaya başla'
    ],
    action: 'DICTATE_START',
    parameters: ['whatsapp_input'],
    description: 'WhatsApp mesaj kutusunda dikteyi başlat',
    examples: ['WhatsApp barına yaz', 'Mesaj kutusuna yaz', "WhatsApp'a yaz"]
  },

  // ========== SES SİSTEMİ KONTROL KOMUTLARI ==========
  {
    id: 'voice_start',
    category: 'SISTEM',
    patterns: ['ses tanımayı başlat', 'ses tanımayı aç', 'sesi aç', 'dinlemeyi başlat', 'mikrofon aç'],
    action: 'VOICE_START',
    parameters: ['start'],
    description: 'Ses tanımayı başlat',
    examples: ['Ses tanımayı başlat', 'Mikrofon aç', 'Dinlemeyi başlat']
  },
  {
    id: 'voice_stop',
    category: 'SISTEM',
    patterns: ['ses tanımayı durdur', 'ses tanımayı kapat', 'sesi kapat', 'dinlemeyi durdur', 'mikrofon kapat'],
    action: 'VOICE_STOP',
    parameters: ['stop'],
    description: 'Ses tanımayı durdur',
    examples: ['Ses tanımayı durdur', 'Mikrofon kapat', 'Dinlemeyi durdur']
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