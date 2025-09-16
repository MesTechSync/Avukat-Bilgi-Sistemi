export const COMMIT_SHA = (import.meta.env.VITE_COMMIT_SHA as string) || 'unknown';
export const BUILD_TIME = (import.meta.env.VITE_BUILD_TIME as string) || '';
export const isDemoMode = false; // Demo modu kaldırıldı