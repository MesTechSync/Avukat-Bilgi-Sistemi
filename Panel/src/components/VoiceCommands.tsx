import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  response: string;
  timestamp: Date;
}

const VoiceCommands: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Sesli komut tanıma
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'tr-TR';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setCurrentCommand(command);
        processVoiceCommand(command);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Ses tanıma hatası:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Sesli yanıt
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    // Simüle edilmiş komut işleme
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let action = '';
    let response = '';
    
    if (command.includes('ara') || command.includes('bul')) {
      action = 'Arama yapılıyor';
      response = 'Hangi konuda arama yapmak istiyorsunuz?';
    } else if (command.includes('dava') || command.includes('karar')) {
      action = 'Dava analizi başlatılıyor';
      response = 'Dava detaylarını analiz ediyorum. Lütfen dava türünü belirtin.';
    } else if (command.includes('mevzuat') || command.includes('kanun')) {
      action = 'Mevzuat araması yapılıyor';
      response = 'Mevzuat bilgilerini getiriyorum. Hangi kanunu arıyorsunuz?';
    } else if (command.includes('tavsiye') || command.includes('öner')) {
      action = 'Hukuki tavsiye veriliyor';
      response = 'Size en uygun hukuki tavsiyeyi hazırlıyorum.';
    } else if (command.includes('tahmin') || command.includes('sonuç')) {
      action = 'Dava sonucu tahmin ediliyor';
      response = 'Dava sonucunu tahmin etmek için analiz yapıyorum.';
    } else if (command.includes('yardım') || command.includes('ne yapabilir')) {
      action = 'Yardım menüsü açılıyor';
      response = 'Size şu komutları kullanabilirsiniz: ara, dava, mevzuat, tavsiye, tahmin.';
    } else {
      action = 'Komut anlaşılamadı';
      response = 'Üzgünüm, komutunuzu anlayamadım. Lütfen tekrar deneyin.';
    }
    
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      command,
      action,
      response,
      timestamp: new Date()
    };
    
    setCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]);
    setCurrentCommand('');
    setIsProcessing(false);
    
    // Sesli yanıt ver
    speak(response);
  };

  const speak = (text: string) => {
    if (synthesisRef.current && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.volume = volume;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearHistory = () => {
    setCommandHistory([]);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sesli Komutlar
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Doğal dil ile hukuki araştırma ve analiz
          </p>
        </div>

        {/* Voice Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Microphone Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`p-4 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20"
                />
              </div>

              {/* Clear History */}
              <button
                onClick={clearHistory}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="text-center">
              {isListening && (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Dinleniyor...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>İşleniyor...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Konuşuyor...</span>
                </div>
              )}
              {!isListening && !isProcessing && !isSpeaking && (
                <p className="text-gray-500 dark:text-gray-400">
                  Mikrofon butonuna basarak konuşmaya başlayın
                </p>
              )}
            </div>

            {/* Current Command */}
            {currentCommand && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Algılanan komut:</strong> {currentCommand}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Command Examples */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Örnek Komutlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { command: 'velayet konusunda ara', description: 'Velayet ile ilgili kararları arar' },
                { command: 'iş sözleşmesi dava analizi', description: 'İş sözleşmesi davalarını analiz eder' },
                { command: 'medeni kanun mevzuat', description: 'Medeni Kanun maddelerini getirir' },
                { command: 'haksız fesih tavsiye', description: 'Haksız fesih konusunda tavsiye verir' },
                { command: 'borç davası tahmin', description: 'Borç davası sonucunu tahmin eder' },
                { command: 'yardım', description: 'Kullanılabilir komutları listeler' }
              ].map((example, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-800 dark:text-white text-sm">
                    "{example.command}"
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {example.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Komut Geçmişi
              </h3>
              <div className="space-y-4">
                {commandHistory.map((cmd) => (
                  <div key={cmd.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          "{cmd.command}"
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {cmd.action}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {cmd.timestamp.toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {cmd.response}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommands;
