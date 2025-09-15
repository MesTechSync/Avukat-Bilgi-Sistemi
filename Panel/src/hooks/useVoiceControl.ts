import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { voiceManager, VoiceIntent } from '../lib/voiceSystem';
import { DynamicCommandGenerator } from '../lib/extendedVoiceCommands';
import { findBestMatches } from '../lib/voicePhonetics';
import { VOICE_FUZZY_ENABLED, VOICE_FUZZY_THRESHOLD } from '../lib/voiceConfig';
import { recordVoiceEvent, flushVoiceQueue } from '../lib/voiceHistory';
import { hasConsent, isRemoteLoggingEnabled } from '../lib/voicePrivacy';

export interface VoiceControlHookResult {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
  lastTranscript: string;
  lastIntent: VoiceIntent | null;
  suggestions: Array<{ command: string; score: number }>;
  error: string | null;
  isProcessing: boolean;
  audioLevel: number;
}

export function useVoiceControl(): VoiceControlHookResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState<VoiceIntent | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ command: string; score: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const groupsRef = useRef<ReturnType<DynamicCommandGenerator['generateAll']> | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(voiceManager.isSupported());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { transcript: string; intent: VoiceIntent };
      setLastTranscript(detail.transcript);
      setLastIntent(detail.intent);
      // Best-effort persist (KVKK consent + logging required)
      if (hasConsent() && isRemoteLoggingEnabled()) {
        recordVoiceEvent({
          transcript: detail.transcript,
          category: detail.intent.category,
          action: detail.intent.action,
          parameters: detail.intent.parameters,
        });
      }
      // compute lightweight suggestions if fuzzy is enabled
      if (VOICE_FUZZY_ENABLED && detail.transcript) {
        try {
          if (!groupsRef.current) {
            const gen = new DynamicCommandGenerator();
            groupsRef.current = gen.generateAll();
          }
          const groups = groupsRef.current!;
          if (debounceRef.current) window.clearTimeout(debounceRef.current);
          debounceRef.current = window.setTimeout(() => {
            const best = findBestMatches(detail.transcript, groups, VOICE_FUZZY_THRESHOLD).slice(0, 3);
            setSuggestions(best.map(b => ({ command: b.command, score: Number(b.score.toFixed(2)) })));
          }, 120);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    const onError = (e: Event) => {
      const d = (e as CustomEvent).detail as { code?: string; message?: string };
      const msg = d?.code === 'not-allowed'
        ? 'Mikrofon izni reddedildi. Tarayıcı ayarlarından mikrofon izni verin.'
        : d?.code === 'no-speech'
          ? 'Ses algılanmadı. Lütfen tekrar deneyin.'
          : d?.message || 'Ses tanıma hatası.';
      setError(msg);
      setListening(false);
    };
  window.addEventListener('voice-command', handler as any);
  // Attempt to flush any queued history entries on mount (only when consent/logging are enabled)
  if (hasConsent() && isRemoteLoggingEnabled()) {
    flushVoiceQueue();
  }
    window.addEventListener('voice-error', onError as any);
    return () => {
      window.removeEventListener('voice-command', handler as any);
      window.removeEventListener('voice-error', onError as any);
    };
  }, []);

  const start = useCallback(() => {
    try {
      setIsProcessing(true);
      voiceManager.start();
      setListening(true);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Ses başlatılamadı');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      voiceManager.stop();
    } finally {
      setListening(false);
    }
  }, []);

  return useMemo(
    () => ({ supported, listening, start, stop, lastTranscript, lastIntent, suggestions, error, isProcessing, audioLevel }),
    [supported, listening, start, stop, lastTranscript, lastIntent, suggestions, error, isProcessing, audioLevel]
  );
}
