import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, X, CheckCircle, AlertCircle, Loader2, History, BookOpen, Zap, MessageSquare } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';

interface VoiceControlProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  showTranscript?: boolean;
  showConfidence?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  autoHide?: boolean;
}

export default function VoiceControl({
  className = '',
  position = 'bottom-right',
  size = 'medium',
  showTranscript = true,
  showConfidence = false,
  showSuggestions = true,
  showHistory = true,
  autoHide = true,
}: VoiceControlProps) {
  const {
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
  } = useVoiceControl();

  const [showSettings, setShowSettings] = useState(false);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [quickCommands, setQuickCommands] = useState<string[]>([]);

  // Not: Hooks sırası tutarlılığı için erken return kullanmıyoruz.

  // Hızlı komutları yükle
  useEffect(() => {
    const commands = getCommandSuggestions('');
    setQuickCommands(commands.slice(0, 4));
  }, [getCommandSuggestions]);

  // Not: Hata durumunda da hooks'lar çağrıldıktan sonra içerikte koşullu render yapacağız.

  // Ana mikrofon butonu
  const getButtonSize = () => {
    switch (size) {
      case 'small': return 'w-12 h-12';
      case 'large': return 'w-16 h-16';
      default: return 'w-14 h-14';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'w-5 h-5';
      case 'large': return 'w-7 h-7';
      default: return 'w-6 h-6';
    }
  };

  // Transcript geçmişini güncelle
  useEffect(() => {
    if (lastTranscript) {
      setShowTranscriptPanel(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowTranscriptPanel(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [lastTranscript, autoHide]);

  // Dikte durumunu göster
  useEffect(() => {
    if (isDictating) {
      setShowTranscriptPanel(true);
    }
  }, [isDictating]);

  return (
    <>
      {/* Hata paneli (yalnızca hata varsa) */}
      {error ? (
        <div className={`fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 
          position === 'bottom-left' ? 'bottom-4 left-4' :
          position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'} z-50`}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Ses Sistemi Hatası</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      {/* Sistem destekleniyorsa ana arayüz */}
      {!error && isSupported ? (
        <div className={`fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 
          position === 'bottom-left' ? 'bottom-4 left-4' :
          position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'} z-50`}>
        <div className="flex flex-col items-end space-y-2">
          {/* Transcript paneli */}
          {showTranscript && showTranscriptPanel && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDictating ? 'Dikte Modu' : 'Son Komut'}
                </span>
                <button
                  onClick={() => setShowTranscriptPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-900 dark:text-white mb-2">
                {isDictating ? dictationText : lastTranscript}
              </p>
              {showConfidence && confidence && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Güven: %{Math.round(confidence * 100)}</span>
                </div>
              )}
              {lastIntent && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {lastIntent.category} → {lastIntent.action}
                </div>
              )}
              {isDictating && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={stopDictation}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Durdur
                  </button>
                  <button
                    onClick={saveDictation}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Kaydet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Öneriler paneli */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Öneriler
                </span>
                <button
                  onClick={() => setShowSuggestionsPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    {suggestion.command}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Komut geçmişi paneli */}
          {showHistory && showHistoryPanel && commandHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Komut Geçmişi
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={clearCommandHistory}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Geçmişi temizle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowHistoryPanel(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {commandHistory.slice(0, 5).map((command, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                    {command}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mikrofon butonu */}
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`
              ${getButtonSize()} 
              rounded-full 
              flex items-center justify-center 
              transition-all duration-200 
              shadow-lg hover:shadow-xl
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${className}
            `}
          >
            {isProcessing ? (
              <Loader2 className={`${getIconSize()} animate-spin`} />
            ) : isListening ? (
              <MicOff className={getIconSize()} />
            ) : (
              <Mic className={getIconSize()} />
            )}
          </button>

          {/* Hızlı erişim butonları */}
          <div className="flex space-x-1">
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Komut geçmişi"
            >
              <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={startDictation}
              className="w-8 h-8 bg-green-100 dark:bg-green-700 rounded-full flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-600 transition-colors"
              title="Dikte başlat"
            >
              <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Durum göstergesi */}
          {isListening && (
            <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{isDictating ? 'Dikte Modu' : 'Dinliyor'}</span>
            </div>
          )}

          {/* Hızlı komutlar */}
          {quickCommands.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-w-xs">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hızlı Komutlar:</div>
              <div className="flex flex-wrap gap-1">
                {quickCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Hızlı komut tıklama işlemi
                      console.log('Hızlı komut:', command);
                    }}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {command}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      ) : null}

      {/* Ayarlar paneli */}
      {showSettings && !error && isSupported && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ses Sistemi Ayarları
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dil
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="tr-TR">Türkçe</option>
                  <option value="en-US">İngilizce</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transcript Göster
                </label>
                <input
                  type="checkbox"
                  checked={showTranscript}
                  onChange={(e) => setShowTranscript(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Güven Skoru Göster
                </label>
                <input
                  type="checkbox"
                  checked={showConfidence}
                  onChange={(e) => setShowConfidence(e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Öneriler Göster
                </label>
                <input
                  type="checkbox"
                  checked={showSuggestions}
                  onChange={(e) => setShowSuggestions(e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Komut Geçmişi Göster
                </label>
                <input
                  type="checkbox"
                  checked={showHistory}
                  onChange={(e) => setShowHistory(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}