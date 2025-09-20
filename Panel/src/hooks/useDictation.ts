import { useState, useRef, useCallback } from 'react';

interface DictationOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export const useDictation = (options: DictationOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { onResult, onError, continuous = false, interimResults = true } = options;

  // Web Speech API desteğini kontrol et
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    return supported;
  }, []);

  // Dikteyi başlat
  const startDictation = useCallback(() => {
    if (!checkSupport()) {
      const errorMsg = 'Tarayıcınız ses tanıma özelliğini desteklemiyor';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = 'tr-TR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimResults) {
          setInterimText(interimTranscript);
        }

        if (finalTranscript) {
          onResult?.(finalTranscript);
          setInterimText('');
        }
      };

      recognition.onerror = (event) => {
        const errorMsg = `Ses tanıma hatası: ${event.error}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errorMsg = 'Ses tanıma başlatılamadı';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [checkSupport, continuous, interimResults, onResult, onError]);

  // Dikteyi durdur
  const stopDictation = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // Dikteyi temizle
  const clearDictation = useCallback(() => {
    setInterimText('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    interimText,
    error,
    startDictation,
    stopDictation,
    clearDictation,
    checkSupport
  };
};

// Global SpeechRecognition tipi tanımı
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
