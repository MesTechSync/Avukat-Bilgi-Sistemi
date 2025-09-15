// Avukat Bilgi Sistemi - Ses Yöneticisi (Web Speech API)

import { matchCommand, matchExtendedCommand } from './voiceCommands';
import { COMMANDS } from './voiceCommands';
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

export function analyzeIntent(transcript: string): VoiceIntent {
  const tnorm = transcript.toLowerCase().trim();
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

  // Heuristic NAV for additional app pages
  if (tnorm.includes('asistan') || tnorm.includes('ai asistan')) {
    return { category: 'NAVIGASYON', action: 'NAV_AI_ASSISTANT', parameters: {} };
  }
  if (tnorm.includes('sözleşme') || tnorm.includes('kontrat')) {
    return { category: 'NAVIGASYON', action: 'NAV_CONTRACT_GENERATOR', parameters: {} };
  }
  if (tnorm.includes('whatsapp')) {
    return { category: 'NAVIGASYON', action: 'NAV_WHATSAPP', parameters: {} };
  }
  if (tnorm.includes('dönüştürücü') || tnorm.includes('dönüştür')) {
    return { category: 'NAVIGASYON', action: 'NAV_FILE_CONVERTER', parameters: {} };
  }
  if (tnorm.includes('profil') || tnorm.includes('hesabım')) {
    return { category: 'NAVIGASYON', action: 'NAV_PROFILE', parameters: {} };
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
      if (id === 'nav_settings') return { category: 'NAVIGASYON', action: 'NAV_SETTINGS', parameters: {} };
    }
  if (id === 'sys_theme_dark' || id === 'view_dark') return { category: 'GORUNUM', action: 'DARK_MODE', parameters: {} };
    if (id === 'sys_theme_light' || id === 'view_light') return { category: 'GORUNUM', action: 'LIGHT_MODE', parameters: {} };
    if (id === 'search_global') {
      const t = transcript.toLowerCase().trim();
      const maybe = t.replace(/^(ara|arama yap|bul|sorgula)\s+/, '').trim();
      const query = maybe && maybe !== t ? maybe : '';
      return { category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: query ? { query } : {} };
    }
    // Dynamic combinations from generator
    if (ext.action?.startsWith?.('NAV_PAGE_')) {
      const page = ext.action.replace('NAV_PAGE_', '');
      const map: any = { dashboard: 'NAV_DASHBOARD', cases: 'NAV_CASES', clients: 'NAV_CLIENTS', calendar: 'NAV_APPOINTMENTS', settings: 'NAV_SETTINGS' };
      const act = map[page] || 'NAV_DASHBOARD';
      return { category: 'NAVIGASYON', action: act, parameters: {} };
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
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) finalText += res[0].transcript;
          }
          const transcript = finalText.trim();
          if (!transcript) return;
          const intent = analyzeIntent(transcript);
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { transcript, intent } }));
          // Always emit raw transcript for potential dictation mode consumers
          try {
            window.dispatchEvent(new CustomEvent('voice-dictation', { detail: { transcript } }));
          } catch {}
        };
        rec.onerror = (ev: any) => {
          try {
            window.dispatchEvent(new CustomEvent('voice-error', { detail: { code: ev?.error ?? 'unknown', message: ev?.message ?? 'Ses tanıma hatası' } }));
          } catch {}
        };
        rec.onend = () => {};
        this.recognition = rec;
      }
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && !!(this.recognition);
  }

  start() {
    try {
      this.recognition?.start?.();
    } catch {}
  }

  stop() {
    try {
      this.recognition?.stop?.();
    } catch {}
  }
}

// Tarayıcı-dışı güvenli singleton
export const voiceManager: { isSupported: () => boolean; start: () => void; stop: () => void } =
  typeof window !== 'undefined' ? new VoiceManager() : { isSupported: () => false, start: () => {}, stop: () => {} };
