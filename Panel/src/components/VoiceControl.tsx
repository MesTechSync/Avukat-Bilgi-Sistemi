import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';

export default function VoiceControl() {
  const { supported, listening, start, stop, lastTranscript, lastIntent } = useVoiceControl() as any;
  // Access suggestions if exposed by hook without breaking existing callers
  const suggestions: Array<{ command: string; score: number }> = (useVoiceControl() as any).suggestions ?? [];

  if (!supported) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 backdrop-blur-sm">
        <button
          aria-label={listening ? 'Dinlemeyi durdur' : 'Dinlemeyi başlat'}
          onClick={listening ? stop : start}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            listening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {listening ? <MicOff className="text-white" /> : <Mic className="text-white" />}
        </button>
        {/* Erişilebilirlik: son niyet/komutu ekran okuyucuya duyur */}
        <div aria-live="polite" role="status" className="sr-only">
          {lastIntent?.category && lastIntent?.action
            ? `Son komut: ${lastIntent.category} - ${lastIntent.action}`
            : ''}
        </div>
        {lastTranscript && (
          <div className="mt-2 max-w-[280px] text-xs text-gray-700 dark:text-gray-200 line-clamp-3">
            "{lastTranscript}"
          </div>
        )}
        {(lastIntent?.action || suggestions.length > 0) && (
          <div className="mt-2 max-w-[280px] text-[11px] text-gray-600 dark:text-gray-300">
            {lastIntent?.action && (
              <div className="mb-1">
                Anlaşılan: <span className="font-medium">{lastIntent.category} / {lastIntent.action}</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div>
                Öneriler:
                <ul className="list-disc ml-4">
                  {suggestions.map((s, i) => (
                    <li key={i}>{s.command} <span className="opacity-60">({s.score})</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
