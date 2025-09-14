// Avukat Bilgi Sistemi - Ses Yöneticisi (Web Speech API)

import { matchCommand } from './voiceCommands';

export type VoiceIntent = { category: string; action: string; parameters: Record<string, any> };

// Pure analyzer used in tests and by the runtime
export function analyzeIntent(transcript: string): VoiceIntent {
  const matched = matchCommand(transcript);
  if (!matched) return { category: '', action: '', parameters: {} };
  return { category: matched.category, action: matched.action, parameters: matched.params ?? {} };
}

class VoiceManager {
  private recognition: any | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'tr-TR';
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
        };
        rec.onerror = () => {};
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
