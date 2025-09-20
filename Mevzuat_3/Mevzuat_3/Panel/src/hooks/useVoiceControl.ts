import { useState, useEffect, useCallback } from 'react';
import { voiceManager } from '../lib/voiceSystem';

export interface VoiceControlState {
  isSupported: boolean;
  isListening: boolean;
  isProcessing: boolean;
  lastTranscript: string;
  lastIntent: any;
  error: string | null;
  confidence: number | null;
  suggestions: Array<{ command: string; score: number }>;
  commandHistory: string[];
  isDictating: boolean;
  dictationText: string;
}

export interface VoiceControlActions {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  clearError: () => void;
  clearTranscript: () => void;
  startDictation: () => void;
  stopDictation: () => void;
  saveDictation: () => void;
  clearCommandHistory: () => void;
  getCommandSuggestions: (input: string) => string[];
}

export function useVoiceControl(): VoiceControlState & VoiceControlActions {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ command: string; score: number }>>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationText, setDictationText] = useState('');

  // Ses sistemi desteğini kontrol et
  useEffect(() => {
    const supported = voiceManager.isSupported();
    setIsSupported(supported);
    
    if (!supported) {
      setError('Ses tanıma desteklenmiyor. Chrome veya Edge kullanın.');
    }
  }, []);

  // Komut geçmişini localStorage'dan yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voice_command_history');
      if (saved) {
        setCommandHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Komut geçmişi yüklenemedi:', error);
    }
  }, []);

  // Komut geçmişini localStorage'a kaydet
  const saveCommandHistory = useCallback((command: string) => {
    setCommandHistory(prev => {
      const newHistory = [command, ...prev.filter(cmd => cmd !== command)].slice(0, 10);
      try {
        localStorage.setItem('voice_command_history', JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Komut geçmişi kaydedilemedi:', error);
      }
      return newHistory;
    });
  }, []);

  // Ses komutları dinleyicisi
  useEffect(() => {
    if (!isSupported) return;

    const handleVoiceCommand = (event: CustomEvent) => {
      const { transcript, intent, confidence: conf } = event.detail;
      setLastTranscript(transcript);
      setLastIntent(intent);
      setConfidence(conf);
      setIsProcessing(false);
      setError(null);
      
      // Komut geçmişine ekle
      if (transcript) {
        saveCommandHistory(transcript);
      }
      
      // Önerileri güncelle
      updateSuggestions(transcript);
    };

    const handleVoiceError = (event: CustomEvent) => {
      const { code, message } = event.detail;
      setError(message || 'Ses tanıma hatası');
      setIsProcessing(false);
      setIsListening(false);
    };

    const handleVoiceState = (event: CustomEvent) => {
      const { listening } = event.detail;
      setIsListening(listening);
    };

    const handleVoiceDictation = (event: CustomEvent) => {
      const { transcript } = event.detail;
      if (isDictating) {
        setDictationText(prev => prev + ' ' + transcript);
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    window.addEventListener('voice-error', handleVoiceError as EventListener);
    window.addEventListener('voice-state', handleVoiceState as EventListener);
    window.addEventListener('voice-dictation', handleVoiceDictation as EventListener);

    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
      window.removeEventListener('voice-error', handleVoiceError as EventListener);
      window.removeEventListener('voice-state', handleVoiceState as EventListener);
      window.removeEventListener('voice-dictation', handleVoiceDictation as EventListener);
    };
  }, [isSupported, isDictating, saveCommandHistory]);

  // Önerileri güncelle
  const updateSuggestions = useCallback((transcript: string) => {
    if (!transcript) {
      setSuggestions([]);
      return;
    }

    // Basit öneri sistemi - hukuki komutlar için
    const legalCommands = [
      'hukuk asistanı', 'içtihat arama', 'mevzuat arama', 'dilekçe yazım',
      'sözleşme oluştur', 'dava yönetimi', 'müvekkil yönetimi', 'randevu yönetimi',
      'mali işler', 'ayarlar', 'hesabım', 'whatsapp destek', 'dosya dönüştürücü'
    ];

    const filteredSuggestions = legalCommands
      .filter(cmd => cmd.toLowerCase().includes(transcript.toLowerCase()) || 
                     transcript.toLowerCase().includes(cmd.toLowerCase()))
      .slice(0, 3)
      .map(cmd => ({ command: cmd, score: 0.8 }));

    setSuggestions(filteredSuggestions);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      voiceManager.start();
    } catch (err) {
      setError('Dinleme başlatılamadı');
      setIsProcessing(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!isSupported) return;
    
    try {
      voiceManager.stop();
      setIsProcessing(false);
    } catch (err) {
      setError('Dinleme durdurulamadı');
    }
  }, [isSupported]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setLastTranscript('');
    setLastIntent(null);
    setConfidence(null);
    setSuggestions([]);
  }, []);

  const startDictation = useCallback(() => {
    setIsDictating(true);
    setDictationText('');
    startListening();
  }, [startListening]);

  const stopDictation = useCallback(() => {
    setIsDictating(false);
    stopListening();
  }, [stopListening]);

  const saveDictation = useCallback(() => {
    if (dictationText) {
      // Dikte metnini kaydetme işlemi burada yapılabilir
      console.log('Dikte kaydedildi:', dictationText);
      setIsDictating(false);
      setDictationText('');
    }
  }, [dictationText]);

  const clearCommandHistory = useCallback(() => {
    setCommandHistory([]);
    try {
      localStorage.removeItem('voice_command_history');
    } catch (error) {
      console.warn('Komut geçmişi temizlenemedi:', error);
    }
  }, []);

  const getCommandSuggestions = useCallback((input: string): string[] => {
    const legalCommands = [
      'hukuk asistanı', 'içtihat arama', 'mevzuat arama', 'dilekçe yazım',
      'sözleşme oluştur', 'dava yönetimi', 'müvekkil yönetimi', 'randevu yönetimi',
      'mali işler', 'ayarlar', 'hesabım', 'whatsapp destek', 'dosya dönüştürücü',
      'karanlık mod', 'aydınlık mod', 'dikte başlat', 'dikte durdur'
    ];

    return legalCommands.filter(cmd => 
      cmd.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  }, []);

  return {
    isSupported,
    isListening,
    isProcessing,
    lastTranscript,
    lastIntent,
    error,
    confidence,
    suggestions,
    commandHistory,
    isDictating,
    dictationText,
    startListening,
    stopListening,
    toggleListening,
    clearError,
    clearTranscript,
    startDictation,
    stopDictation,
    saveDictation,
    clearCommandHistory,
    getCommandSuggestions,
  };
}