// KVKK-aware privacy controls for voice features

const KEYS = {
  consent: 'voice_privacy_consent_v1',
  remoteLogging: 'voice_privacy_remote_logging_v1',
  piiMasking: 'voice_privacy_pii_masking_v1',
};

function lsGet(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function lsSet(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, value); } catch {}
}

export function hasConsent(): boolean {
  return lsGet(KEYS.consent, 'false') === 'true';
}

export function setConsent(granted: boolean) {
  lsSet(KEYS.consent, granted ? 'true' : 'false');
}

export function isRemoteLoggingEnabled(): boolean {
  // default off per data minimization
  return lsGet(KEYS.remoteLogging, 'false') === 'true';
}

export function setRemoteLogging(enabled: boolean) {
  lsSet(KEYS.remoteLogging, enabled ? 'true' : 'false');
}

export function isPIIMaskingEnabled(): boolean {
  // default on for safety
  return lsGet(KEYS.piiMasking, 'true') === 'true';
}

export function setPIIMasking(enabled: boolean) {
  lsSet(KEYS.piiMasking, enabled ? 'true' : 'false');
}

// Basic anonymization: mask emails, phone numbers, ID-like numbers, and simple names tokens
export function anonymizeTranscript(text: string): string {
  if (!text) return text;
  let s = text;
  // Emails
  s = s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]');
  // Phone numbers (various formats, Turkish common patterns)
  s = s.replace(/\b\+?90?\s?(\(?\d{3}\)?)[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g, '[phone]');
  s = s.replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[phone]');
  // ID-like long numbers (TCKN 11 digits)
  s = s.replace(/\b\d{11}\b/g, '[id]');
  // Case numbers like 2024/12345
  s = s.replace(/\b\d{4}\/\d{3,6}\b/g, '[case-no]');
  // Simple person-name masking: capitalized word pairs (best-effort)
  s = s.replace(/\b([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)\b/g, '[name]');
  return s;
}
