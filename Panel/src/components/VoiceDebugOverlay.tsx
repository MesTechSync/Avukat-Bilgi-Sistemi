import React from 'react';

export default function VoiceDebugOverlay() {
  const [visible, setVisible] = React.useState(false);
  const [state, setState] = React.useState<{ listening: boolean; last?: any; error?: string; confidence?: number }>({ listening: false });

  React.useEffect(() => {
    try { setVisible((localStorage.getItem('voice_debug_overlay') ?? 'off') === 'on'); } catch {}
    const onCmd = (e: Event) => {
      const d = (e as CustomEvent).detail as any;
      setState(s => ({ ...s, last: { transcript: d?.transcript, intent: d?.intent }, confidence: d?.confidence }));
    };
    const onErr = (e: Event) => {
      const d = (e as CustomEvent).detail as any;
      setState(s => ({ ...s, error: d?.message || d?.code || 'error' }));
    };
    const onState = (e: Event) => {
      const d = (e as CustomEvent).detail as any;
      setState(s => ({ ...s, listening: !!d?.listening }));
    };
    window.addEventListener('voice-command', onCmd as any);
    window.addEventListener('voice-error', onErr as any);
    window.addEventListener('voice-state', onState as any);
    return () => {
      window.removeEventListener('voice-command', onCmd as any);
      window.removeEventListener('voice-error', onErr as any);
      window.removeEventListener('voice-state', onState as any);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black/70 text-white rounded-lg p-3 text-xs max-w-sm whitespace-pre-wrap">
        <div>Listening: {state.listening ? 'yes' : 'no'}</div>
        {state.confidence !== undefined && <div>Confidence: {state.confidence.toFixed(2)}</div>}
        {state.last?.transcript && <div>Transcript: "{state.last.transcript}"</div>}
        {state.last?.intent && <div>Intent: {state.last.intent.category} / {state.last.intent.action}</div>}
        {state.error && <div className="text-red-300">Error: {state.error}</div>}
        <div className="mt-1 opacity-70">Overlay: localStorage voice_debug_overlay=on/off</div>
      </div>
    </div>
  );
}
