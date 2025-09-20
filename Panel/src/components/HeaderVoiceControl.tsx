import React from 'react';
import { Mic, MicOff, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';

interface HeaderVoiceControlProps {
  className?: string;
}

// Header-anchored microphone button with a lightweight popover for status/transcript
// Uses the same voice system via useVoiceControl; avoids floating UI over page content
const HeaderVoiceControl: React.FC<HeaderVoiceControlProps> = ({ className = '' }) => {
  const {
    isSupported,
    isListening,
    isProcessing,
    lastTranscript,
    lastIntent,
    error,
    confidence,
    toggleListening,
    clearError,
  } = useVoiceControl();

  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // Auto-open panel when we start listening or when a transcript arrives
  React.useEffect(() => {
    if (isListening || lastTranscript || error) setOpen(true);
  }, [isListening, lastTranscript, error]);

  // Close on Escape and basic focus trap when panel is open
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // Focus close by default when open
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!isSupported) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-sm hover:bg-white/50 dark:hover:bg-gray-700/50 ${
          isListening ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Dinlemeyi durdur' : 'Mikrofonu başlat'}
        data-pressed={isListening ? 'true' : 'false'}
  aria-haspopup="dialog"
  aria-controls="voice-popover"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Status/Transcript Panel (dropdown) */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-40">
          <div
            id="voice-popover"
            ref={panelRef}
            role="dialog"
            aria-labelledby="voice-popover-title"
            aria-modal="true"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {error ? (
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                ) : isListening ? (
                  <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Dinliyor
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs" id="voice-popover-title">
                    <CheckCircle className="w-4 h-4 text-gray-400" /> Hazır
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {error && (
                  <button onClick={clearError} className="text-red-500 hover:text-red-700" title="Hata mesajını temizle">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button ref={closeBtnRef} onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Kapat">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <>
                {lastTranscript ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900 dark:text-white" aria-live="polite">{lastTranscript}</p>
                    {typeof confidence === 'number' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">Güven: %{Math.round(confidence * 100)}</div>
                    )}
                    {lastIntent && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">{lastIntent.category} → {lastIntent.action}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Komut bekleniyor. Mikrofonu kullanarak konuşabilirsiniz.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderVoiceControl;
