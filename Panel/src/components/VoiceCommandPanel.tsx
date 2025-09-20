import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Command, Search, HelpCircle } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { matchCommand, getCommandCategories, TOTAL_COMMANDS } from '../lib/voiceCommands';

export const VoiceCommandPanel: React.FC = () => {
  const { isListening, transcript, startListening, stopListening } = useVoiceControl();
  const [showHelp, setShowHelp] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    if (transcript) {
      const command = matchCommand(transcript);
      if (command) {
        executeCommand(command);
        setCommandHistory(prev => [transcript, ...prev.slice(0, 9)]);
      }
    }
  }, [transcript]);

  const executeCommand = (command: any) => {
    // Komut yürütme mantığı
    console.log('Executing command:', command);
    
    switch (command.action) {
      case 'NAVIGATE':
        window.location.hash = `#/${command.parameters[0]}`;
        break;
      case 'SEARCH':
        // Arama işlemi
        break;
      case 'CREATE':
        // Oluşturma işlemi
        break;
      case 'THEME':
        document.documentElement.classList.toggle('dark', command.parameters[0] === 'dark');
        break;
      // Diğer aksiyonlar...
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Ana Mikrofon Butonu */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full shadow-lg transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        aria-label={isListening ? 'Dinlemeyi durdur' : 'Sesli komut başlat'}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>

      {/* Komut Yardım Paneli */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="absolute top-0 right-14 p-2 bg-gray-700 text-white rounded-full"
      >
        <HelpCircle size={20} />
      </button>

      {/* Transcript Göstergesi */}
      {transcript && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {/* Yardım Modalı */}
      {showHelp && (
        <div className="absolute bottom-16 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-3 flex items-center">
            <Command className="mr-2" />
            Sesli Komutlar ({TOTAL_COMMANDS}+ komut)
          </h3>
          
          <div className="space-y-2">
            {getCommandCategories().map(category => (
              <details key={category} className="cursor-pointer">
                <summary className="font-medium text-sm hover:text-blue-500">
                  {category}
                </summary>
                <ul className="ml-4 mt-1 text-xs space-y-1">
                  <li>• "Ana sayfaya git"</li>
                  <li>• "Davaları göster"</li>
                  <li>• "Yeni müvekkil ekle"</li>
                  {/* Kategori örnekleri */}
                </ul>
              </details>
            ))}
          </div>

          {/* Komut Geçmişi */}
          {commandHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Son Komutlar</h4>
              <ul className="text-xs space-y-1">
                {commandHistory.map((cmd, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400">
                    {cmd}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};