// Avukat Bilgi Sistemi - Basit Ses Yöneticisi (Web Speech API)

export type VoiceIntent = {
  category:
    | 'DAVA_YONETIMI'
    | 'MUVEKKIL_ISLEMLERI'
    | 'BELGE_ISLEMLERI'
    | 'TAKVIM_YONETIMI'
    | 'ARAMA_SORGULAMA'
    | 'NAVIGASYON'
    | 'GORUNUM'
    | '';
  action: string;
  parameters?: Record<string, any>;
};

export class VoiceManager {
  private recognition: any | null = null;
  private listening = false;
  public onResult?: (finalTranscript: string) => void;

  constructor() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR';
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const res = event.results[last];
        const transcript = String(res[0]?.transcript || '').trim();
        if (res.isFinal && transcript) {
          try {
            this.handleTranscript(transcript.toLowerCase());
          } catch {
            // no-op
          }
        }
      };
      this.recognition.onerror = () => {};
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start() {
    if (this.recognition && !this.listening) {
      this.recognition.start();
      this.listening = true;
    }
  }

  public stop() {
    if (this.recognition && this.listening) {
      this.recognition.stop();
      this.listening = false;
    }
  }

  private handleTranscript(transcript: string) {
    if (this.onResult) this.onResult(transcript);
    const intent = this.analyzeIntent(transcript);
    window.dispatchEvent(
      new CustomEvent('voice-command', { detail: { transcript, intent } })
    );
  }

  public analyzeIntent(transcript: string): VoiceIntent {
    const t = transcript;
    const intent: VoiceIntent = { category: '', action: '', parameters: {} };

    // Görünüm
    if (t.includes('karanlık') || t.includes('gece')) {
      return { category: 'GORUNUM', action: 'DARK_MODE', parameters: {} };
    }
    if (t.includes('aydınlık') || t.includes('gündüz')) {
      return { category: 'GORUNUM', action: 'LIGHT_MODE', parameters: {} };
    }

    // Navigasyon
    if (t.includes('ana sayfa')) return { category: 'NAVIGASYON', action: 'NAV_DASHBOARD' };
    if (t.includes('dava')) return { category: 'NAVIGASYON', action: 'NAV_CASES' };
    if (t.includes('müvekkil')) return { category: 'NAVIGASYON', action: 'NAV_CLIENTS' };
    if (t.includes('takvim') || t.includes('randevu')) return { category: 'NAVIGASYON', action: 'NAV_APPOINTMENTS' };
    if (t.includes('ayar')) return { category: 'NAVIGASYON', action: 'NAV_SETTINGS' };

    // Arama
    if (t.startsWith('ara ') || t.includes('arama yap')) {
      return { category: 'ARAMA_SORGULAMA', action: 'SEARCH', parameters: { query: t.replace(/^ara\s+/,'') } };
    }

    return intent;
  }
}

export const voiceManager = new VoiceManager();
