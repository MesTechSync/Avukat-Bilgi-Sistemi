export function speak(text: string) {
  if (typeof window === 'undefined') return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
  const Utter: any = (window as any).SpeechSynthesisUtterance || (globalThis as any).SpeechSynthesisUtterance || function(t: string){ return { text: t, lang: 'tr-TR' }; };
  const utter = new Utter(text);
    // Prefer Turkish voice if available
    const voices = synth.getVoices();
    const tr = voices.find(v => v.lang?.toLowerCase().startsWith('tr'));
    if (tr) utter.voice = tr;
    utter.lang = tr?.lang || 'tr-TR';
    synth.speak(utter);
  } catch {}
}
