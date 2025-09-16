import { createClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

// In unit tests, provide safe localhost defaults so module import doesn't throw.
const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'

const supabaseUrl = ((CONFIG.SUPABASE_URL as string) || undefined) ?? undefined
const supabaseAnonKey = ((CONFIG.SUPABASE_ANON_KEY as string) || undefined) ?? undefined

// If env is missing (common in local preview), disable Supabase to avoid crashing the SPA
const SUPABASE_ENABLED = Boolean(supabaseUrl && supabaseAnonKey) || isTestEnv

let supabase: ReturnType<typeof createClient> | any
if (SUPABASE_ENABLED) {
  const resolvedUrl = supabaseUrl || 'http://127.0.0.1:54321'
  const resolvedKey = supabaseAnonKey || 'test-anon-key'
  supabase = createClient(resolvedUrl, resolvedKey)
} else {
  // Lightweight mock so accidental direct usages don't blow up
  supabase = {
    from() {
      return {
        select: async () => ({ data: [], error: null, count: 0 }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ eq: async () => ({ error: null }) }),
        ilike: () => this,
        or: () => this,
        eq: () => this,
        limit: () => this,
      }
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
  // eslint-disable-next-line no-console
  console.info('[supabase] Disabled (no VITE_SUPABASE_URL/ANON_KEY). Running in mock mode.')
}

export { supabase, SUPABASE_ENABLED }

// Database Types
export interface Case {
  id: number
  title: string
  client_id: number
  case_type: string
  status: string
  deadline: string
  priority: string
  amount: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  title: string
  date: string
  time: string
  type: string
  status: string
  client_id?: number
  case_id?: number
  description?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  title: string
  type: string
  category: string
  file_path: string
  case_id?: number
  client_id?: number
  created_at: string
  updated_at: string
}

export interface LegalResearch {
  id: number
  title: string
  source: string
  category: string
  relevance: string
  content?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface Financial {
  id: number
  type: 'income' | 'expense'
  amount: string
  description: string
  category: string
  date: string
  case_id?: number
  client_id?: number
  created_at: string
  updated_at: string
}

export interface VoiceHistory {
  id: number
  transcript: string
  category: string
  action: string
  parameters: Record<string, any> | null
  created_at: string
}

// Typed helpers
type TableMap = {
  cases: Case;
  clients: Client;
  appointments: Appointment;
  documents: Document;
  financials: Financial;
  legal_research: LegalResearch;
  voice_history: VoiceHistory;
};

export async function dbSelect<T extends keyof TableMap>(table: T, columns = '*'): Promise<{ data: TableMap[T][]; error: any }>{
  if (!SUPABASE_ENABLED) return { data: [], error: null }
  // @ts-ignore - supabase type generic differs in mock
  const { data, error } = await (supabase.from(table).select(columns));
  return { data: (data ?? []) as TableMap[T][], error };
}

export async function dbInsert<T extends keyof TableMap>(table: T, row: Partial<TableMap[T]>): Promise<{ data: TableMap[T] | null; error: any }>{
  if (!SUPABASE_ENABLED) return { data: null, error: null }
  // @ts-ignore
  const { data, error } = await (supabase.from(table).insert(row).select().single());
  return { data: (data ?? null) as TableMap[T] | null, error };
}

export async function dbUpdate<T extends keyof TableMap>(table: T, id: number | string, patch: Partial<TableMap[T]>): Promise<{ data: TableMap[T] | null; error: any }>{
  if (!SUPABASE_ENABLED) return { data: null, error: null }
  // @ts-ignore
  const { data, error } = await (supabase.from(table).update(patch).eq('id', id).select().single());
  return { data: (data ?? null) as TableMap[T] | null, error };
}

export async function dbDelete<T extends keyof TableMap>(table: T, id: number | string): Promise<{ error: any }>{
  if (!SUPABASE_ENABLED) return { error: null }
  // @ts-ignore
  const { error } = await (supabase.from(table).delete().eq('id', id));
  return { error };
}

// Domain-specific helpers
export async function searchLegalResearch(params: {
  query: string;
  legalArea?: string;
  limit?: number;
}): Promise<{ data: LegalResearch[]; total: number; timeMs: number; error: any }>{
  const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  if (!SUPABASE_ENABLED) {
    const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    return { data: [], total: 0, timeMs: Math.round((end - start)), error: null }
  }
  let q = supabase
    .from('legal_research')
    .select('*', { count: 'exact' })
    .limit(params.limit ?? 50);

  const qtext = (params.query || '').trim();
  if (qtext) {
    // basic ilike search on title or content
    const like = `%${qtext}%`;
    // @ts-ignore - typed columns are strings
    q = q.ilike('title', like).or(`content.ilike.${like}`);
  }
  if (params.legalArea) {
    // @ts-ignore
    q = q.eq('category', params.legalArea);
  }
  const { data, error, count } = await q;
  const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  return { data: (data ?? []) as LegalResearch[], total: count ?? 0, timeMs: Math.round((end - start)), error };
}