import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Typed helpers
type TableMap = {
  cases: Case;
  clients: Client;
  appointments: Appointment;
  documents: Document;
  financials: Financial;
  legal_research: LegalResearch;
};

export async function dbSelect<T extends keyof TableMap>(table: T, columns = '*'): Promise<{ data: TableMap[T][]; error: any }>{
  // @ts-ignore - supabase type generic differs in mock
  const { data, error } = await (supabase.from(table).select(columns));
  return { data: (data ?? []) as TableMap[T][], error };
}

export async function dbInsert<T extends keyof TableMap>(table: T, row: Partial<TableMap[T]>): Promise<{ data: TableMap[T] | null; error: any }>{
  // @ts-ignore
  const { data, error } = await (supabase.from(table).insert(row).select().single());
  return { data: (data ?? null) as TableMap[T] | null, error };
}

export async function dbUpdate<T extends keyof TableMap>(table: T, id: number | string, patch: Partial<TableMap[T]>): Promise<{ data: TableMap[T] | null; error: any }>{
  // @ts-ignore
  const { data, error } = await (supabase.from(table).update(patch).eq('id', id).select().single());
  return { data: (data ?? null) as TableMap[T] | null, error };
}

export async function dbDelete<T extends keyof TableMap>(table: T, id: number | string): Promise<{ error: any }>{
  // @ts-ignore
  const { error } = await (supabase.from(table).delete().eq('id', id));
  return { error };
}