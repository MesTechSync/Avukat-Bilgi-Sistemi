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

// Basic Turkish mishear normalization and filler filtering
function preprocessTranscript(raw: string): string {
  if (!raw) return '';
  let t = raw.toLowerCase().trim();
  // Common fillers to remove
  const fillers = [' ya ', ' yani ', ' hani ', ' şey ', ' ee ', ' eee ', ' ıı ', ' ııı ', ' aaa ', ' haa ', ' hmm '];
  t = ' ' + t + ' ';
  for (const f of fillers) t = t.replaceAll(f, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  // Common mishears
  const replaces: Array<[RegExp, string]> = [
    [/\barax\b|\baray\b/g, 'ara'],
    [/\bkonusma\b/g, 'konuşma'],
    [/\bguvenlik\b/g, 'güvenlik'],
    [/\bgorunum\b/g, 'görünüm'],
    [/\bayarlar?\b/g, 'ayarlar'],
    [/\bprofilim\b/g, 'profil'],
    [/\bguvenlig?i?\b/g, 'güvenlik'],
    [/\bgorun[uü]m\b/g, 'görünüm'],
    [/\btem[ae]\b/g, 'tema'],
    [/\bm[uü]vekkil y[öo]netimi\b/g, 'müvekkil yönetimi'],
    [/\bdava y[öo]netimi\b/g, 'dava yönetimi'],
    [/\brandevu y[öo]netimi\b/g, 'randevu yönetimi'],
    [/\bi[cç]tihat(arama| araştırma)?\b/g, 'içtihat arama'],
  ];
  for (const [r, v] of replaces) t = t.replace(r, v);
  return t.trim();
}

export function analyzeIntent(transcript: string): VoiceIntent {
  const transcriptNorm = preprocessTranscript(transcript);
  const tnorm = transcriptNorm.toLowerCase().trim();
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
  // Dilekçe yazımı (petition writer) kısayolu
  if (tnorm.includes('dilekçe')) {
    return { category: 'NAVIGASYON', action: 'NAV_PETITION_WRITER', parameters: {} };
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
