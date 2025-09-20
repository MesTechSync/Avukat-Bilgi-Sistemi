// Avukat Bilgi Sistemi - Ses Yöneticisi (Web Speech API)

import { matchCommand, matchExtendedCommand } from './voiceCommands';
import { findBestMatches, ContextAwareCorrector } from './voicePhonetics';
import { DynamicCommandGenerator } from './extendedVoiceCommands';
import { VOICE_FUZZY_ENABLED, VOICE_FUZZY_THRESHOLD, VOICE_FUZZY_STRICT_SCORE, VOICE_FUZZY_CONTEXT_SCORE } from './voiceConfig';

export type VoiceIntent = { category: string; action: string; parameters: Record<string, any> };

// Pure analyzer used in tests and by the runtime
const contextCorrector = new ContextAwareCorrector();
const commandGenerator = new DynamicCommandGenerator();
const allCommands = commandGenerator.generateAll();

// Require at least one 3+ letter token from the command to appear in the transcript
function hasTokenOverlap(transcript: string, command: string): boolean {
  const t = transcript.toLowerCase();
  const tokens = command.toLowerCase().split(/[^a-zçğıöşâîûü0-9]+/i).filter(w => w.length >= 3);
  return tokens.some(tok => t.includes(tok));
}

// Basic Turkish mishear normalization and filler filtering
function preprocessTranscript(raw: string): string {
  if (!raw) return '';
  let t = raw.toLowerCase().trim();
  // Common fillers to remove
  const fillers = [' ya ', ' yani ', ' hani ', ' şey ', ' ee ', ' eee ', ' ıı ', ' ııı ', ' aaa ', ' haa ', ' hmm '];
  t = ' ' + t + ' ';
  for (const f of fillers) t = t.split(f).join(' ');
  t = t.replace(/\s+/g, ' ').trim();
  // Hukuki terimler için yaygın yanlış telaffuz düzeltmeleri
  const replaces: Array<[RegExp, string]> = [
    // Temel komutlar
    [/\barax\b|\baray\b|\baro\b/g, 'ara'],
    [/\bkonusma\b/g, 'konuşma'],
    [/\bguvenlik\b/g, 'güvenlik'],
    [/\bgorunum\b/g, 'görünüm'],
    [/\bayarlar?\b/g, 'ayarlar'],
    [/\bprofilim\b/g, 'profil'],
    [/\bguvenlig?i?\b/g, 'güvenlik'],
    [/\bgorun[uü]m\b/g, 'görünüm'],
    [/\btem[ae]\b/g, 'tema'],
    
    // Hukuki terimler
    [/\bm[uü]vekkil y[öo]netimi\b/g, 'müvekkil yönetimi'],
    [/\bdava y[öo]netimi\b/g, 'dava yönetimi'],
    [/\brandevu y[öo]netimi\b/g, 'randevu yönetimi'],
    [/\bi[cç]tihat(arama| araştırma)?\b/g, 'içtihat arama'],
    [/\bmevzuat(arama| araştırma)?\b/g, 'mevzuat arama'],
    [/\bkarar(arama| araştırma)?\b/g, 'karar arama'],
    [/\bhukuk asistan[ıi]\b/g, 'hukuk asistanı'],
    [/\byapay zeka\b/g, 'yapay zeka'],
    [/\bdilek[cç]e yaz[ıi]m\b/g, 'dilekçe yazım'],
    [/\blayiha yaz\b/g, 'layiha yaz'],
    [/\bs[öo]zle[sş]me olu[sş]tur\b/g, 'sözleşme oluştur'],
    [/\bkontrat haz[ıi]rla\b/g, 'kontrat hazırla'],
    [/\bmukavele olu[sş]tur\b/g, 'mukavele oluştur'],
    [/\bvekaletname\b/g, 'vekaletname'],
    [/\bvekalet\b/g, 'vekalet'],
    [/\byetki belgesi\b/g, 'yetki belgesi'],
    [/\bwhatsapp destek\b/g, 'whatsapp destek'],
    [/\bwp destek\b/g, 'wp destek'],
    [/\b7\/24 destek\b/g, '7/24 destek'],
    [/\bcanl[ıi] destek\b/g, 'canlı destek'],
    [/\bdosya d[öo]n[uü][sş]t[uü]r[uü]c[uü]\b/g, 'dosya dönüştürücü'],
    [/\bformat d[öo]n[uü][sş]t[uü]r\b/g, 'format dönüştür'],
    [/\bbelge d[öo]n[uü][sş]t[uü]r\b/g, 'belge dönüştür'],
    
    // Dava türleri
    [/\bbosanma\b/g, 'boşanma'],
    [/\bnafaka\b/g, 'nafaka'],
    [/\bvelayet\b/g, 'velayet'],
    [/\btazminat\b/g, 'tazminat'],
    [/\balacak\b/g, 'alacak'],
    [/\bicra\b/g, 'icra'],
    [/\bitiraz\b/g, 'itiraz'],
    
    // Mahkeme ve kurumlar
    [/\byarg[ıi]tay\b/g, 'yargıtay'],
    [/\bdan[ıi][sş]tay\b/g, 'danıştay'],
    [/\bmahkeme\b/g, 'mahkeme'],
    [/\badliye\b/g, 'adliye'],
    [/\bnoter\b/g, 'noter'],
    [/\bbaro\b/g, 'baro'],
    [/\badli t[ıi]p\b/g, 'adli tıp'],
    
    // Mali terimler
    [/\bmali i[sş]ler\b/g, 'mali işler'],
    [/\bfinans\b/g, 'finans'],
    [/\bmuhasebe\b/g, 'muhasebe'],
    [/\b[öo]demeler\b/g, 'ödemeler'],
    [/\bfaturalar\b/g, 'faturalar'],
    [/\btahsilat\b/g, 'tahsilat'],
  ];
  for (const [r, v] of replaces) t = t.replace(r, v);
  return t.trim();
}

export function analyzeIntent(transcript: string): VoiceIntent {
  const transcriptNorm = preprocessTranscript(transcript);
  const tnorm = transcriptNorm.toLowerCase().trim();
  // Helper: extract numeric index from phrases like "1. sonuç", "2 kayıt", "3. müvekkil", or just a number
  const extractIndex = (s: string): number | null => {
    if (/\bilk\b/.test(s)) return 1;
    const m = s.match(/\b(\d{1,3})\b/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > 0) return n;
    }
    return null;
  };
  // Settings sub-navigation: "ayarlar sistem", "ayarlar güvenlik" etc.
  if (tnorm.includes('ayar')) {
    const tabMap: Record<string, string> = {
      'profil': 'profile',
      'güvenlik': 'security', 'guvenlik': 'security',
      'bildirim': 'notifications', 'bildirimler': 'notifications',
      'görünüm': 'appearance', 'gorunum': 'appearance', 'tema': 'appearance',
      'sistem': 'system',
      'ses': 'voice', 'konuşma': 'voice', 'konusma': 'voice'
    };
    let tab: string | undefined;
    // Look for tab keywords even if "ayarlar" not adjacent
    for (const k of Object.keys(tabMap)) {
      const re = new RegExp(`(^|\b)${k}(\b|$)`, 'i');
      if (re.test(tnorm)) { tab = tabMap[k]; break; }
    }
    if (tab) return { category: 'NAVIGASYON', action: 'NAV_SETTINGS', parameters: { tab } };
    return { category: 'NAVIGASYON', action: 'NAV_SETTINGS', parameters: {} };
  }
  // Heuristic: If transcript clearly asks for filtering or sorting on a known page, prefer LIST actions over NAV
  const filterKeys = ['filtrele', 'filtre', 'filtreleme', 'filtre uygula', 'süz', 'süzgeç'];
  const sortKeys = ['sırala', 'sıralama', 'sıralama yap', 'artan sırala', 'azalan sırala'];
  const pageMap: Record<string, string> = {
    // cases
    'dava': 'cases', 'davalar': 'cases', 'dosya': 'cases', 'dosyalar': 'cases',
    // clients
    'müvekkil': 'clients', 'müvekkiller': 'clients', 'müşteri': 'clients', 'müşteriler': 'clients', 'danışan': 'clients', 'danışanlar': 'clients',
    // calendar (kept for completeness)
    'randevu': 'calendar', 'randevular': 'calendar', 'takvim': 'calendar', 'ajanda': 'calendar', 'duruşma': 'calendar', 'duruşmalar': 'calendar'
  };
  const hasAny = (keys: string[]) => keys.some(k => tnorm.includes(k));
  const page = Object.keys(pageMap).find(k => tnorm.includes(k));
  if (page) {
    // Extract simple parameters
    const parameters: any = { page: pageMap[page] };
    if (pageMap[page] === 'cases') {
      // Recognize common status words
      const statusMap: Record<string, string> = {
        'beklemede': 'Beklemede',
        'devam': 'Devam Ediyor', 'devam ediyor': 'Devam Ediyor',
        'inceleme': 'İnceleme', 'incelemede': 'İnceleme',
        'tamamlandı': 'Tamamlandı', 'bitti': 'Tamamlandı',
        'iptal': 'İptal', 'iptal edildi': 'İptal'
      };
      for (const k of Object.keys(statusMap)) {
        if (tnorm.includes(k)) {
          parameters.filter = { ...(parameters.filter || {}), status: statusMap[k] };
          break;
        }
      }
      // Priority
      const prioMap: Record<string, string> = {
        'acil': 'Acil', 'yüksek': 'Yüksek', 'orta': 'Orta', 'düşük': 'Düşük'
      };
      for (const k of Object.keys(prioMap)) {
        if (tnorm.includes(k)) {
          parameters.filter = { ...(parameters.filter || {}), priority: prioMap[k] };
          break;
        }
      }
      // Case type keywords
      const typeMap: Record<string, string> = {
        'ticari': 'Ticari Hukuk',
        'iş': 'İş Hukuku',
        'aile': 'Aile Hukuku',
        'ceza': 'Ceza Hukuku',
        'idare': 'İdare Hukuku',
        'medeni': 'Medeni Hukuk',
        'borçlar': 'Borçlar Hukuku',
        'miras': 'Miras Hukuku'
      };
      for (const k of Object.keys(typeMap)) {
        if (tnorm.includes(k)) {
          parameters.filter = { ...(parameters.filter || {}), case_type: typeMap[k] };
          break;
        }
      }
    }
    if (hasAny(filterKeys)) {
      return { category: 'LIST', action: 'FILTER', parameters };
    }
    if (hasAny(sortKeys)) {
      // Basic example: allow 'isim' or 'ad' ascending for clients
      if (parameters.page === 'clients') {
        const by = tnorm.includes('isim') || tnorm.includes('ad') ? 'name' : undefined;
        const dir = tnorm.includes('azalan') ? 'desc' : 'asc';
        parameters.sort = { by: by || 'name', dir };
      }
      return { category: 'LIST', action: 'SORT', parameters };
    }
  }

  // Mevzuat_3'e özel hukuki navigasyon komutları
  if (tnorm.includes('hukuk asistanı') || tnorm.includes('ai asistan') || tnorm.includes('yapay zeka') || tnorm.includes('asistan') || tnorm.includes('chat') || tnorm.includes('soru sor')) {
    return { category: 'NAVIGASYON', action: 'NAV_AI_ASSISTANT', parameters: {} };
  }
  if (tnorm.includes('içtihat arama') || tnorm.includes('mevzuat arama') || tnorm.includes('karar arama') || tnorm.includes('hukuki arama') || tnorm.includes('içtihatlar') || tnorm.includes('mevzuat')) {
    return { category: 'NAVIGASYON', action: 'NAV_SEARCH', parameters: {} };
  }
  if (tnorm.includes('dilekçe yazım') || tnorm.includes('dilekçe oluştur') || tnorm.includes('dilekçe hazırla') || tnorm.includes('layiha yaz') || tnorm.includes('dilekçe yaz')) {
    return { category: 'NAVIGASYON', action: 'NAV_PETITION_WRITER', parameters: {} };
  }
  if (tnorm.includes('sözleşme oluştur') || tnorm.includes('kontrat hazırla') || tnorm.includes('sözleşme yaz') || tnorm.includes('mukavele oluştur') || tnorm.includes('anlaşma yap')) {
    return { category: 'NAVIGASYON', action: 'NAV_CONTRACT_GENERATOR', parameters: {} };
  }
  if (tnorm.includes('whatsapp destek') || tnorm.includes('whatsapp') || tnorm.includes('wp destek') || tnorm.includes('7/24 destek') || tnorm.includes('canlı destek')) {
    return { category: 'NAVIGASYON', action: 'NAV_WHATSAPP', parameters: {} };
  }
  // Notebook LLM navigasyonu (çeşitli varyantlar)
  if (tnorm.includes('notebook llm') || (tnorm.includes('notebook') && tnorm.includes('llm')) || tnorm.includes('ai notebook') || tnorm.includes('yapay zeka notebook') || tnorm.includes('ai defter')) {
    return { category: 'NAVIGASYON', action: 'NAV_NOTEBOOK_LLM', parameters: {} };
  }
  if (tnorm.includes('dosya dönüştürücü') || tnorm.includes('format dönüştür') || tnorm.includes('dosya çevir') || tnorm.includes('belge dönüştür')) {
    return { category: 'NAVIGASYON', action: 'NAV_FILE_CONVERTER', parameters: {} };
  }
  if (tnorm.includes('profil') || tnorm.includes('hesabım') || tnorm.includes('kullanıcı profili') || tnorm.includes('hesap bilgileri')) {
    return { category: 'NAVIGASYON', action: 'NAV_PROFILE', parameters: {} };
  }

  // ========== PAGE-SPECIFIC INTENTS (deep controls) ==========
  // Appointments (Randevu) page
  if (/(randevu|randevular|takvim|ajanda|duruşma|duruşmalar)/.test(tnorm)) {
    // View switching
    if (/(liste görünümü|liste|tablo)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_VIEW', parameters: { view: 'list' } };
    if (/(takvim görünümü|takvim|calendar)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_VIEW', parameters: { view: 'calendar' } };
    // New appointment
    if (/(yeni randevu|randevu oluştur|randevu ekle)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_NEW', parameters: {} };
    // Status filters
    const statusMap: Record<string, string> = { 'planlandı': 'Planlandı', 'onaylandı': 'Onaylandı', 'beklemede': 'Beklemede', 'tamamlandı': 'Tamamlandı', 'iptal': 'İptal Edildi', 'iptal edildi': 'İptal Edildi' };
    for (const k of Object.keys(statusMap)) if (tnorm.includes(k) && /(durum|filtre|filtrele)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_STATUS', parameters: { status: statusMap[k] } };
  // Type filters (e.g., Duruşma, Keşif, Danışmanlık, Noterlik İşlemleri)
  const typeKeys = ['duruşma', 'uzlaştırma', 'keşif', 'icra', 'noter', 'mahkeme', 'danışmanlık', 'konsültasyon', 'belge', 'imza'];
  for (const t of typeKeys) if (tnorm.includes(t) && /(tür|tip|filtre|filtrele)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_TYPE', parameters: { type: t } };
  // Priority filters
  const prMap: Record<string, string> = { 'acil': 'acil', 'yüksek': 'yüksek', 'normal': 'normal', 'düşük': 'düşük' };
  for (const p of Object.keys(prMap)) if (tnorm.includes(p) && /(öncelik|priority|filtre|filtrele)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_PRIORITY', parameters: { priority: prMap[p] } };
    // Search in appointments
    if (/\bara\b|arama yap|bul|sorgula/.test(tnorm)) {
      const q = tnorm.replace(/^(randevu(lar)?\s*)?\b(ara|arama yap|bul|sorgula)\s+/, '').trim();
      return { category: 'PAGE', action: 'APPOINTMENTS_SEARCH', parameters: { query: q } };
    }
    // Date range quick filters e.g. "bu hafta", "bu ay", "gelecek hafta", "geçen ay"
    if (/(bu hafta)/.test(tnorm)) {
      const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay()); const end = new Date(start); end.setDate(start.getDate() + 6);
      return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_DATE_RANGE', parameters: { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10) } };
    }
    if (/(bu ay)/.test(tnorm)) {
      const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_DATE_RANGE', parameters: { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10) } };
    }
    if (/(gelecek hafta|sonraki hafta)/.test(tnorm)) {
      const now = new Date(); const start = new Date(now); start.setDate(now.getDate() + (7 - now.getDay())); const end = new Date(start); end.setDate(start.getDate() + 6);
      return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_DATE_RANGE', parameters: { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10) } };
    }
    if (/(geçen ay)/.test(tnorm)) {
      const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { category: 'PAGE', action: 'APPOINTMENTS_FILTER_DATE_RANGE', parameters: { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10) } };
    }
    if (/(filtreleri temizle|filtreleri sıfırla|temizle)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_CLEAR_FILTERS', parameters: {} };
    // Calendar navigation
    if (/(sonraki ay|gelecek ay|ileri)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_CAL_NAV', parameters: { step: 'next' } };
    if (/(önceki ay|geçen ay|geri)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_CAL_NAV', parameters: { step: 'prev' } };
    if (/(bugün|bugune|bugune git)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_CAL_NAV', parameters: { step: 'today' } };
    // Pagination for list view
    if (/(sonraki sayfa|ileri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_PAGE_NEXT', parameters: {} };
    if (/(önceki sayfa|geri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_PAGE_PREV', parameters: {} };
    // Open/edit/delete by index (list view)
    if (/(aç|göster|düzenle|sil)/.test(tnorm)) {
      const idx = extractIndex(tnorm);
      if (idx != null) {
        if (/sil/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_DELETE_INDEX', parameters: { index: idx } };
        if (/(düzenle|edit)/.test(tnorm)) return { category: 'PAGE', action: 'APPOINTMENTS_EDIT_INDEX', parameters: { index: idx } };
        return { category: 'PAGE', action: 'APPOINTMENTS_OPEN_INDEX', parameters: { index: idx } };
      }
    }
  }

  // Advanced Search (İçtihat & Mevzuat)
  if (/(içtihat|mevzuat|arama sayfası|hukuki arama|karar arama)/.test(tnorm)) {
    // Mode switching
    if (/(içtihat modu|içtihat ara)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_SET_MODE', parameters: { mode: 'ictihat' } };
    if (/(mevzuat modu|mevzuat ara)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_SET_MODE', parameters: { mode: 'mevzuat' } };
    // Court type
    const ctMap: Record<string, string> = { yargıtay: 'yargitay', danıştay: 'danistay', 'bölge adliye': 'bam', istinaf: 'istinaf', aym: 'aym', sayıştay: 'sayistay', emsal: 'emsal', hukuk: 'hukuk' };
    for (const k of Object.keys(ctMap)) if (tnorm.includes(k)) return { category: 'PAGE', action: 'SEARCH_SET_COURT', parameters: { courtType: ctMap[k] } };
    // Legal area
    if (/hukuk alanı/.test(tnorm)) {
      const area = tnorm.split('hukuk alanı')[1]?.trim();
      if (area) return { category: 'PAGE', action: 'SEARCH_SET_LEGAL_AREA', parameters: { legalArea: area } };
    }
    // Quick date ranges e.g., "son 6 ay"
    const m = tnorm.match(/son\s+(\d{1,2})\s+ay/);
    if (m) return { category: 'PAGE', action: 'SEARCH_SET_DATE_RANGE', parameters: { months: parseInt(m[1], 10) } };
    if (/(filtreleri aç|filtreleri kapat|filtreleri göster|filtreleri gizle)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_TOGGLE_FILTERS', parameters: { toggle: true } };
    // Sort
    if (/(tarihe göre sırala|en yeni|en güncel|yeni önce)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_SORT', parameters: { by: 'date', dir: 'desc' } };
    if (/(en eski|eskiye göre)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_SORT', parameters: { by: 'date', dir: 'asc' } };
    if (/(alakaya göre|ilgili önce|relevans)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_SORT', parameters: { by: 'relevance', dir: 'desc' } };
    // Pagination and open result by index
    if (/(sonraki sayfa|ileri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_PAGE_NEXT', parameters: {} };
    if (/(önceki sayfa|geri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'SEARCH_PAGE_PREV', parameters: {} };
    if (/(sonuç|kayıt).*(aç|göster)/.test(tnorm) || /(aç|göster).*sonuç/.test(tnorm)) {
      const idx = extractIndex(tnorm);
      if (idx != null) return { category: 'PAGE', action: 'SEARCH_OPEN_INDEX', parameters: { index: idx } };
    }
    // Run search (query extracted)
    if (/\bara\b|arama yap|sorgula|bul/.test(tnorm)) {
      const q = tnorm.replace(/^(içtihat|mevzuat)?\s*(ara|arama yap|sorgula|bul)\s+/, '').trim();
      return { category: 'PAGE', action: 'SEARCH_RUN', parameters: { query: q } };
    }
  }

  // Financials
  if (/(mali işler|finans|muhasebe|ödemeler|faturalar|tahsilat)/.test(tnorm)) {
    if (/(genel bakış|overview)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_TAB', parameters: { tab: 'overview' } };
    if (/(işlemler|transactions)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_TAB', parameters: { tab: 'transactions' } };
    if (/(raporlar|reports)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_TAB', parameters: { tab: 'reports' } };
    if (/(sadece gelir|gelirleri göster|gelir filtresi)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_FILTER', parameters: { type: 'income' } };
    if (/(sadece gider|giderleri göster|gider filtresi)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_FILTER', parameters: { type: 'expense' } };
    if (/(dışa aktar|indir|csv|excel)/.test(tnorm)) return { category: 'PAGE', action: 'FINANCIALS_EXPORT', parameters: {} };
    if (/(bu ay|geçen ay|son 3 ay|son 6 ay)/.test(tnorm)) {
      if (tnorm.includes('bu ay')) return { category: 'PAGE', action: 'FINANCIALS_TIME_RANGE', parameters: { months: 1, mode: 'this' } };
      if (tnorm.includes('geçen ay')) return { category: 'PAGE', action: 'FINANCIALS_TIME_RANGE', parameters: { months: 1, mode: 'prev' } };
      if (tnorm.includes('son 3 ay')) return { category: 'PAGE', action: 'FINANCIALS_TIME_RANGE', parameters: { months: 3, mode: 'last' } };
      if (tnorm.includes('son 6 ay')) return { category: 'PAGE', action: 'FINANCIALS_TIME_RANGE', parameters: { months: 6, mode: 'last' } };
    }
  }

  // Clients
  if (/(müvekkil|müşteri|danışan)/.test(tnorm)) {
    if (/(yeni müvekkil|müvekkil ekle|müşteri ekle|danışan ekle)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_NEW', parameters: {} };
    if (/\bara\b|arama yap|bul|sorgula/.test(tnorm)) {
      const q = tnorm.replace(/^(müvekkil|müşteri|danışan)?\s*(ara|arama yap|bul|sorgula)\s+/, '').trim();
      return { category: 'PAGE', action: 'CLIENTS_SEARCH', parameters: { query: q } };
    }
    if (/(şirkete göre|firma|company)/.test(tnorm)) {
      const company = tnorm.split(/şirkete göre|firma|company/)[1]?.trim() || '';
      if (company) return { category: 'PAGE', action: 'CLIENTS_FILTER_COMPANY', parameters: { company } };
    }
    if (/(ada göre sırala|isme göre sırala)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_SORT', parameters: { by: 'name', dir: tnorm.includes('azalan') ? 'desc' : 'asc' } };
    if (/(tarihe göre sırala)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_SORT', parameters: { by: 'date', dir: tnorm.includes('azalan') ? 'desc' : 'asc' } };
    if (/(filtreleri temizle|filtreleri sıfırla)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_CLEAR_FILTERS', parameters: {} };
    if (/(sonraki sayfa|ileri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_PAGE_NEXT', parameters: {} };
    if (/(önceki sayfa|geri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'CLIENTS_PAGE_PREV', parameters: {} };
    if (/(müvekkil|kayıt|kart|öğe|item).*(aç|göster|seç)/.test(tnorm) || /(aç|göster|seç).*müvekkil/.test(tnorm)) {
      const idx = extractIndex(tnorm);
      if (idx != null) return { category: 'PAGE', action: 'CLIENTS_OPEN_INDEX', parameters: { index: idx } };
    }
  }

  // Cases
  if (/(dava|dosya)/.test(tnorm)) {
    if (/(yeni dava|dava oluştur|dosya aç)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_NEW', parameters: {} };
    if (/\bara\b|arama yap|bul|sorgula/.test(tnorm)) {
      const q = tnorm.replace(/^(dava|dosya)?\s*(ara|arama yap|bul|sorgula)\s+/, '').trim();
      return { category: 'PAGE', action: 'CASES_SEARCH', parameters: { query: q } };
    }
    const sMap: Record<string, string> = { 'aktif': 'active', 'kapalı': 'closed', 'tamamlanan': 'closed', 'devam': 'active' };
    for (const k of Object.keys(sMap)) if (tnorm.includes(k) && /(filtre|filtrele|durum)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_FILTER_STATUS', parameters: { status: sMap[k] } };
    // Case type and priority filters
    const typeWords: Record<string, string> = { ticari: 'Ticari Hukuk', 'iş': 'İş Hukuku', aile: 'Aile Hukuku', ceza: 'Ceza Hukuku', idare: 'İdare Hukuku', medeni: 'Medeni Hukuk', borçlar: 'Borçlar Hukuku', miras: 'Miras Hukuku' };
    for (const k of Object.keys(typeWords)) if (tnorm.includes(k) && /(tür|tip|filtre|filtrele)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_FILTER_TYPE', parameters: { case_type: typeWords[k] } };
    const prWords: Record<string, string> = { acil: 'Acil', yüksek: 'Yüksek', orta: 'Orta', düşük: 'Düşük' };
    for (const k of Object.keys(prWords)) if (tnorm.includes(k) && /(öncelik|priority|filtre|filtrele)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_FILTER_PRIORITY', parameters: { priority: prWords[k] } };
    if (/(tarihe göre sırala)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_SORT', parameters: { by: 'date', dir: tnorm.includes('azalan') ? 'desc' : 'asc' } };
    if (/(başlığa göre sırala|isme göre sırala)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_SORT', parameters: { by: 'title', dir: tnorm.includes('azalan') ? 'desc' : 'asc' } };
    if (/(tutara göre sırala)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_SORT', parameters: { by: 'amount', dir: tnorm.includes('artan') ? 'asc' : 'desc' } };
    if (/(filtreleri temizle|filtreleri sıfırla)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_CLEAR_FILTERS', parameters: {} };
    if (/(sonraki sayfa|ileri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_PAGE_NEXT', parameters: {} };
    if (/(önceki sayfa|geri sayfa)/.test(tnorm)) return { category: 'PAGE', action: 'CASES_PAGE_PREV', parameters: {} };
    if (/(dava|dosya|kayıt|kart|öğe|item).*(aç|göster|seç)/.test(tnorm) || /(aç|göster|seç).*(dava|dosya)/.test(tnorm)) {
      const idx = extractIndex(tnorm);
      if (idx != null) return { category: 'PAGE', action: 'CASES_OPEN_INDEX', parameters: { index: idx } };
    }
  }

  const matched = matchCommand(transcript);
  if (matched) return { category: matched.category, action: matched.action, parameters: matched.params ?? {} };

  // Fallback: try extended registry for broader coverage and map to app actions
  const ext = matchExtendedCommand(transcript);
  if (ext) {
    // Map extended IDs/categories to core actions used by the app
    const id = ext.id;
    if (id.startsWith('nav_')) {
      if (id === 'nav_dashboard') return { category: 'NAVIGASYON', action: 'NAV_DASHBOARD', parameters: {} };
      if (id === 'nav_cases') return { category: 'NAVIGASYON', action: 'NAV_CASES', parameters: {} };
      if (id === 'nav_clients') return { category: 'NAVIGASYON', action: 'NAV_CLIENTS', parameters: {} };
      if (id === 'nav_calendar' || id === 'nav_appointments') return { category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', parameters: {} };
      if (id === 'nav_finance') return { category: 'NAVIGASYON', action: 'NAV_FINANCIALS', parameters: {} };
      if (id === 'nav_notebook_llm') return { category: 'NAVIGASYON', action: 'NAV_NOTEBOOK_LLM', parameters: {} };
      if (id === 'nav_settings') return { category: 'NAVIGASYON', action: 'NAV_SETTINGS', parameters: {} };
    }
  if (id === 'sys_theme_dark' || id === 'view_dark') return { category: 'GORUNUM', action: 'DARK_MODE', parameters: {} };
    if (id === 'sys_theme_light' || id === 'view_light') return { category: 'GORUNUM', action: 'LIGHT_MODE', parameters: {} };
    if (id === 'search_global' || id === 'search_legal_terms') {
      const t = transcript.toLowerCase().trim();
      const maybe = t.replace(/^(ara|arama yap|bul|sorgula|içtihat ara|karar ara|mevzuat ara)\s+/, '').trim();
      const query = maybe && maybe !== t ? maybe : '';
      return { category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: query ? { query } : {} };
    }
    if (id === 'search_court_decisions') {
      const t = transcript.toLowerCase().trim();
      const maybe = t.replace(/^(yargıtay kararı ara|danıştay kararı ara|mahkeme kararı ara|karar ara)\s+/, '').trim();
      const query = maybe && maybe !== t ? maybe : '';
      return { category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: query ? { query, type: 'court_decisions' } : { type: 'court_decisions' } };
    }
    if (id === 'search_laws') {
      const t = transcript.toLowerCase().trim();
      const maybe = t.replace(/^(kanun ara|yasa ara|mevzuat ara|hukuk ara|düzenleme ara)\s+/, '').trim();
      const query = maybe && maybe !== t ? maybe : '';
      return { category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: query ? { query, type: 'laws' } : { type: 'laws' } };
    }
    // Dynamic combinations from generator
    if (ext.action?.startsWith?.('NAV_PAGE_')) {
      const page = ext.action.replace('NAV_PAGE_', '');
      const map: any = { dashboard: 'NAV_DASHBOARD', cases: 'NAV_CASES', clients: 'NAV_CLIENTS', calendar: 'NAV_APPOINTMENTS', settings: 'NAV_SETTINGS' };
      const act = map[page] || 'NAV_DASHBOARD';
      return { category: 'NAVIGASYON', action: act, parameters: {} };
    }
        // Dictation target mappings
        if (ext.action === 'DICTATE_START') {
          if (id === 'dictate_whatsapp' || ext.parameters?.[0] === 'whatsapp_input') {
            return { category: 'DİKTE', action: 'DICTATE_START', parameters: { target: 'whatsapp_input' } };
          }
          return { category: 'DİKTE', action: 'DICTATE_START', parameters: {} };
        }
    if (ext.action?.startsWith?.('FILTER_')) {
      const page = ext.action.replace('FILTER_', '');
      return { category: 'LIST', action: 'FILTER', parameters: { page } };
    }
    if (ext.action?.startsWith?.('SORT_')) {
      const page = ext.action.replace('SORT_', '');
      return { category: 'LIST', action: 'SORT', parameters: { page } };
    }
    if (ext.action?.startsWith?.('NAV_TIME_')) {
      const page = ext.action.replace('NAV_TIME_', '');
      return { category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS', parameters: { page, time: true } };
    }
  }

  // Son çare: fonetik/donanımlı bulanık eşleşme (opsiyonel)
  if (VOICE_FUZZY_ENABLED) {
    const suggestions = findBestMatches(transcript, allCommands, VOICE_FUZZY_THRESHOLD);
    if (suggestions.length > 0) {
      const best = suggestions[0];
      // Prefer a safe high-confidence suggestion (not generic ACTIONS and not too short)
  const safeStrict = suggestions.find(s => s.score > VOICE_FUZZY_STRICT_SCORE && s.category !== 'ACTIONS' && s.command.length >= 4 && hasTokenOverlap(transcript, s.command));
      if (safeStrict) {
        contextCorrector.addToHistory(transcript);
        return {
          category: safeStrict.category,
          action: safeStrict.action,
          parameters: extractParameters(transcript, safeStrict.command),
        };
      }
      // Otherwise, if the top is high-confidence but generic, do not accept; continue to context path
      if (best.score > VOICE_FUZZY_CONTEXT_SCORE) {
        const contextHints = contextCorrector.suggestBasedOnContext();
        for (const hint of contextHints) {
          if (transcript.includes(hint)) {
            return { category: best.category, action: best.action, parameters: { context: hint, query: transcript } };
          }
        }
        // Try to find a next-best safe suggestion under context threshold
  const safeContext = suggestions.find(s => s.category !== 'ACTIONS' && s.command.length >= 4 && hasTokenOverlap(transcript, s.command));
        if (safeContext) {
          return {
            category: safeContext.category,
            action: safeContext.action,
            parameters: extractParameters(transcript, safeContext.command),
          };
        }
      }
    }
  }

  // Conservative fallback: accept a non-generic, overlapping suggestion if score is reasonably high
  if (VOICE_FUZZY_ENABLED) {
    const suggestions = findBestMatches(transcript, allCommands, VOICE_FUZZY_THRESHOLD);
    const safe = suggestions.find(s => s.category !== 'ACTIONS' && hasTokenOverlap(transcript, s.command) && s.score >= Math.max(VOICE_FUZZY_THRESHOLD + 0.05, 0.65));
    if (safe) {
      return {
        category: safe.category,
        action: safe.action,
        parameters: extractParameters(transcript, safe.command),
      };
    }
  }

  // Unknown command
  // WhatsApp özel dikte tetikleyici (geniş kapsamlı yakalama)
  if (tnorm.includes('whatsapp') && (tnorm.includes('yaz') || tnorm.includes('mesaj'))) {
    return { category: 'DİKTE', action: 'DICTATE_START', parameters: { target: 'whatsapp_input' } };
  }
  return { category: '', action: '', parameters: {} };
}

function extractParameters(transcript: string, pattern: string): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Transcript'ten pattern'i çıkar, kalanı parametre olarak al
  const cleanedTranscript = transcript.toLowerCase().trim();
  const cleanedPattern = pattern.toLowerCase().trim();
  
  if (cleanedTranscript.includes(cleanedPattern)) {
    const remaining = cleanedTranscript.replace(cleanedPattern, '').trim();
    if (remaining) {
      params.query = remaining;
    }
  }
  
  // Tarih çıkarımı
  const datePatterns = [
    { pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, type: 'date' },
    { pattern: /(bugün|yarın|dün)/gi, type: 'relative_date' },
    { pattern: /(\d{1,2}:\d{2})/g, type: 'time' }
  ];
  
  datePatterns.forEach(({ pattern, type }) => {
    const matches = cleanedTranscript.match(pattern);
    if (matches) {
      params[type] = matches[0];
    }
  });
  
  return params;
}

class VoiceManager {
  private recognition: any | null = null;
  private stoppedByUser = false;
  private backoffMs = 500;
  private backoffCap = 5000;
  private speakingGate = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SR) {
        const rec = new SR();
        try {
          const savedLang = localStorage.getItem('voice_recognition_lang') || 'tr-TR';
          rec.lang = savedLang;
        } catch {
          rec.lang = 'tr-TR';
        }
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (event: any) => {
          let finalText = '';
          let confidence: number | undefined = undefined;
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalText += res[0].transcript;
              if (typeof res[0]?.confidence === 'number') confidence = res[0].confidence;
            }
          }
          const transcript = finalText.trim();
          if (!transcript) return;
          // Gate while TTS is speaking (optional)
          try {
            const ttsGate = (localStorage.getItem('voice_tts_gate') ?? 'on') !== 'off';
            if (ttsGate && this.speakingGate) {
              // Defer silently
              return;
            }
          } catch {}
          // Min confidence gating (configurable via localStorage: voice_min_confidence)
          try {
            const raw = localStorage.getItem('voice_min_confidence') ?? '0';
            const minConf = Math.max(0, Math.min(1, parseFloat(raw)));
            if (!Number.isNaN(minConf) && typeof confidence === 'number' && confidence < minConf) {
              try {
                window.dispatchEvent(new CustomEvent('voice-error', { detail: { code: 'low-confidence', message: 'Güven değeri eşiğin altında', confidence, min: minConf, transcript } }));
              } catch {}
              // Do not analyze intent when below threshold
              this.backoffMs = 500;
              return;
            }
          } catch {}
          const intent = analyzeIntent(transcript);
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { transcript, intent, confidence } }));
          // Always emit raw transcript for potential dictation mode consumers
          try {
            window.dispatchEvent(new CustomEvent('voice-dictation', { detail: { transcript } }));
          } catch {}
          // Reset backoff on successful result
          this.backoffMs = 500;
        };
        rec.onerror = (ev: any) => {
          try {
            window.dispatchEvent(new CustomEvent('voice-error', { detail: { code: ev?.error ?? 'unknown', message: ev?.message ?? 'Ses tanıma hatası' } }));
          } catch {}
          // Auto-restart unless permission denied or explicitly stopped
          const auto = this.isAutoRestartEnabled();
          const code = ev?.error;
          const fatal = code === 'not-allowed' || code === 'service-not-allowed';
          if (!this.stoppedByUser && auto && !fatal) {
            const delay = Math.min(this.backoffMs, this.backoffCap);
            window.setTimeout(() => { try { rec.start(); } catch {} }, delay);
            this.backoffMs = Math.min(this.backoffMs * 2, this.backoffCap);
          }
        };
        rec.onend = () => {
          const auto = this.isAutoRestartEnabled();
          if (!this.stoppedByUser && auto) {
            const delay = Math.min(this.backoffMs, this.backoffCap);
            window.setTimeout(() => { try { rec.start(); } catch {} }, delay);
            this.backoffMs = Math.min(this.backoffMs * 2, this.backoffCap);
          }
          try { window.dispatchEvent(new CustomEvent('voice-state', { detail: { listening: false } })); } catch {}
        };
        this.recognition = rec;
      }
      // Track TTS speaking state
      try {
        window.addEventListener('tts-start', () => { this.speakingGate = true; });
        window.addEventListener('tts-end', () => { this.speakingGate = false; });
      } catch {}
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!(this.recognition);
  }

  start() {
    try {
      this.stoppedByUser = false;
      this.backoffMs = 500;
      this.recognition?.start?.();
      try { window.dispatchEvent(new CustomEvent('voice-state', { detail: { listening: true } })); } catch {}
    } catch {}
  }

  stop() {
    try {
      this.stoppedByUser = true;
      this.recognition?.stop?.();
      try { window.dispatchEvent(new CustomEvent('voice-state', { detail: { listening: false } })); } catch {}
    } catch {}
  }

  private isAutoRestartEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try { return (localStorage.getItem('voice_autorestart') ?? 'on') !== 'off'; } catch { return true; }
  }
}

// Tarayıcı-dışı güvenli singleton
export const voiceManager: { isSupported: () => boolean; start: () => void; stop: () => void } =
  typeof window !== 'undefined' ? new VoiceManager() : { isSupported: () => false, start: () => {}, stop: () => {} };