import { dbInsert } from './supabase';
import { hasConsent, isRemoteLoggingEnabled, isPIIMaskingEnabled, anonymizeTranscript } from './voicePrivacy';

type HistoryItem = {
  transcript: string;
  category: string;
  action: string;
  parameters?: Record<string, any> | null;
  created_at?: string;
};

const QUEUE_KEY = 'voice_history_queue_v1';

function loadQueue(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function saveQueue(items: HistoryItem[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-20))); } catch {}
}

export async function recordVoiceEvent(item: HistoryItem) {
  // KVKK: require prior consent and explicit remote logging opt-in
  if (!hasConsent() || !isRemoteLoggingEnabled()) return;
  const sanitized = isPIIMaskingEnabled() ? { ...item, transcript: anonymizeTranscript(item.transcript) } : item;
  const payload = { ...sanitized, created_at: new Date().toISOString() };
  try {
    const { error } = await dbInsert('voice_history' as any, payload as any);
    if (error) throw error;
  } catch {
    const q = loadQueue();
    q.push(payload);
    saveQueue(q);
  }
}

export async function flushVoiceQueue() {
  const q = loadQueue();
  if (!q.length) return;
  if (!hasConsent() || !isRemoteLoggingEnabled()) return; // do not flush without consent/logging enabled
  const remaining: HistoryItem[] = [];
  for (const item of q) {
    try {
      const sanitized = isPIIMaskingEnabled() ? { ...item, transcript: anonymizeTranscript(item.transcript) } : item;
      const { error } = await dbInsert('voice_history' as any, sanitized as any);
      if (error) throw error;
    } catch {
      remaining.push(item);
    }
  }
  saveQueue(remaining);
}