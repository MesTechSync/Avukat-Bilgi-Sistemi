// Ses sistemi geçmişi ve gizlilik yönetimi

export interface VoiceEvent {
  timestamp: number;
  transcript: string;
  category: string;
  action: string;
  parameters: Record<string, any>;
}

class VoiceHistory {
  private events: VoiceEvent[] = [];
  private maxEvents = 100;

  addEvent(event: VoiceEvent): void {
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
  }

  getEvents(): VoiceEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

export const voiceHistory = new VoiceHistory();

export function recordVoiceEvent(event: VoiceEvent): void {
  voiceHistory.addEvent(event);
}

export function getVoiceHistory(): VoiceEvent[] {
  return voiceHistory.getEvents();
}

export function clearVoiceHistory(): void {
  voiceHistory.clear();
}

// Gizlilik yönetimi
export function hasConsent(): boolean {
  try {
    return localStorage.getItem('voice_consent') === 'true';
  } catch {
    return false;
  }
}

export function setConsent(consent: boolean): void {
  try {
    localStorage.setItem('voice_consent', consent.toString());
  } catch {
    // Ignore
  }
}

export function isRemoteLoggingEnabled(): boolean {
  try {
    return localStorage.getItem('voice_remote_logging') === 'true';
  } catch {
    return false;
  }
}

export function setRemoteLogging(enabled: boolean): void {
  try {
    localStorage.setItem('voice_remote_logging', enabled.toString());
  } catch {
    // Ignore
  }
}

// Kuyruk yönetimi
const voiceQueue: VoiceEvent[] = [];

export function flushVoiceQueue(): void {
  if (voiceQueue.length > 0 && hasConsent() && isRemoteLoggingEnabled()) {
    // Burada uzak sunucuya gönderme işlemi yapılabilir
    voiceQueue.length = 0;
  }
}
