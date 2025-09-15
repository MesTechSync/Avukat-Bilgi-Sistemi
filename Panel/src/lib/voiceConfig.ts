// Voice system configuration with safe defaults

const env = (import.meta as any)?.env ?? {};

function ls(key: string): string | null {
	if (typeof window === 'undefined') return null;
	try { return window.localStorage.getItem(key); } catch { return null; }
}

export const VOICE_FUZZY_ENABLED: boolean = (ls('VITE_VOICE_FUZZY') ?? env.VITE_VOICE_FUZZY ?? 'on') !== 'off';
export const VOICE_FUZZY_THRESHOLD: number = Number(ls('VITE_VOICE_FUZZY_THRESHOLD') ?? env.VITE_VOICE_FUZZY_THRESHOLD ?? 0.6);
export const VOICE_FUZZY_STRICT_SCORE: number = Number(ls('VITE_VOICE_FUZZY_STRICT_SCORE') ?? env.VITE_VOICE_FUZZY_STRICT_SCORE ?? 0.85);
export const VOICE_FUZZY_CONTEXT_SCORE: number = Number(ls('VITE_VOICE_FUZZY_CONTEXT_SCORE') ?? env.VITE_VOICE_FUZZY_CONTEXT_SCORE ?? 0.65);
