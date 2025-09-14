import { useCallback, useEffect, useMemo, useState } from 'react';
import { voiceManager, VoiceIntent } from '../lib/voiceSystem';

export function useVoiceControl() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState<VoiceIntent | null>(null);

  useEffect(() => {
    setSupported(voiceManager.isSupported());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { transcript: string; intent: VoiceIntent };
      setLastTranscript(detail.transcript);
      setLastIntent(detail.intent);
    };
    window.addEventListener('voice-command', handler as any);
    return () => window.removeEventListener('voice-command', handler as any);
  }, []);

  const start = useCallback(() => {
    voiceManager.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    voiceManager.stop();
    setListening(false);
  }, []);

  return useMemo(() => ({ supported, listening, start, stop, lastTranscript, lastIntent }), [supported, listening, start, stop, lastTranscript, lastIntent]);
}
