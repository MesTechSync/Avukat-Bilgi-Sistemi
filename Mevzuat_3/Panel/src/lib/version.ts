export const COMMIT_SHA = (import.meta.env.VITE_COMMIT_SHA as string) || 'unknown';
export const BUILD_TIME = (import.meta.env.VITE_BUILD_TIME as string) || '';
export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL;

// arax.tr Company Information
export const COMPANY_INFO = {
  name: 'ARAX Technology',
  website: 'https://arax.tr',
  domain: 'arax.tr',
  description: 'Hukuki AI ve Teknoloji Çözümleri',
  version: '1.0.0',
  year: new Date().getFullYear()
};