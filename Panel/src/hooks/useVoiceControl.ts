import { useCallback, useEffect, useMemo, useState } from 'react';
import { voiceManager, VoiceIntent } from '../lib/voiceSystem';
import { DynamicCommandGenerator } from '../lib/extendedVoiceCommands';
import { findBestMatches } from '../lib/voicePhonetics';
import { VOICE_FUZZY_ENABLED, VOICE_FUZZY_THRESHOLD } from '../lib/voiceConfig';

export function useVoiceControl() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState<VoiceIntent | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ command: string; score: number }>>([]);

  useEffect(() => {
    setSupported(voiceManager.isSupported());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { transcript: string; intent: VoiceIntent };
      setLastTranscript(detail.transcript);
      setLastIntent(detail.intent);
      // compute lightweight suggestions if fuzzy is enabled
      if (VOICE_FUZZY_ENABLED && detail.transcript) {
        try {
          const gen = new DynamicCommandGenerator();
          const groups = gen.generateAll();
          const best = findBestMatches(detail.transcript, groups, VOICE_FUZZY_THRESHOLD).slice(0, 3);
          setSuggestions(best.map(b => ({ command: b.command, score: Number(b.score.toFixed(2)) })));
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
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

  return useMemo(
    () => ({ supported, listening, start, stop, lastTranscript, lastIntent, suggestions }),
    [supported, listening, start, stop, lastTranscript, lastIntent, suggestions]
  );
}
