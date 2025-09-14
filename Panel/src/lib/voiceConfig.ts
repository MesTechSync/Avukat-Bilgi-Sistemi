// Voice system configuration with safe defaults

const env = (import.meta as any)?.env ?? {};

export const VOICE_FUZZY_ENABLED: boolean = (env.VITE_VOICE_FUZZY ?? 'on') !== 'off';
export const VOICE_FUZZY_THRESHOLD: number = Number(env.VITE_VOICE_FUZZY_THRESHOLD ?? 0.6);
export const VOICE_FUZZY_STRICT_SCORE: number = Number(env.VITE_VOICE_FUZZY_STRICT_SCORE ?? 0.85);
export const VOICE_FUZZY_CONTEXT_SCORE: number = Number(env.VITE_VOICE_FUZZY_CONTEXT_SCORE ?? 0.7);
