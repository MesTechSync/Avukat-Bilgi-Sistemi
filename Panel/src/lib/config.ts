export type AppConfig = {
  MODE: string;
  PROD: boolean;
  DEMO: boolean; // Always false in production-only setup
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  PRIVACY: {
    kvkkConsentRequired: boolean;
    remoteLoggingDefault: boolean;
  };
};

const MODE = import.meta.env.MODE;
const PROD = import.meta.env.PROD;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
// Demo modu kaldırıldı: her zaman gerçek ortam varsayılır
const DEMO = false;

export const CONFIG: AppConfig = {
  MODE,
  PROD,
  DEMO,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  PRIVACY: {
    kvkkConsentRequired: (import.meta.env.VITE_KVKK_CONSENT_REQUIRED as string | undefined) !== 'false',
    remoteLoggingDefault: (import.meta.env.VITE_REMOTE_LOGGING_DEFAULT as string | undefined) === 'true',
  },
};

export function assertProdEnv() {
  // Disabled to allow running without Supabase in demo/local preview
  // If you want to enforce configuration, re-enable the check below.
  // if (CONFIG.PROD) {
  //   if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  //     throw new Error('Production mode requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  //   }
  // }
}
