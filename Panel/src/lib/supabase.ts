// ...existing code...
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase environment variables eksik!\nVITE_SUPABASE_URL: ${supabaseUrl}\nVITE_SUPABASE_ANON_KEY: ${supabaseAnonKey}`);
}
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Supabase bağlantısı test ediliyor...');
  
  // Test clients table
  const { data: clientData, error: clientError } = await supabase.from('clients').select('*').limit(1);
  if (clientError) {
    console.error('Clients tablosu hatası:', clientError);
  } else {
    console.log('Clients tablosu başarılı:', clientData);
  }
  
  // Test cases table structure
  const { data: caseData, error: caseError } = await supabase.from('cases').select('*').limit(1);
  if (caseError) {
    console.error('Cases tablosu hatası:', caseError);
  } else {
    console.log('Cases tablosu başarılı:', caseData);
  }
  
  // Test cases table columns specifically
  const { data: caseColumns, error: columnError } = await supabase.rpc('get_table_columns', { table_name: 'cases' });
  if (columnError) {
    console.log('Column bilgisi alınamadı (normal):', columnError.message);
  } else {
    console.log('Cases tablosu kolonları:', caseColumns);
  }
}

testConnection();
export { testConnection };

// Database Types
export interface Case {
  id: string
  user_id: string
  title: string
  case_number?: string
  client_id?: string
  client_name?: string
  case_type?: string
  status: string
  priority: string
  amount?: number
  description?: string
  deadline?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  title: string
  date: string
  time: string
  type?: string
  status: string
  client_id?: string
  case_id?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  type: string
  category: string
  file_path: string
  case_id?: string
  client_id?: string
  created_at: string
  updated_at: string
}

export interface LegalResearch {
  id: string
  user_id: string
  title: string
  source?: string
  category?: string
  relevance?: string
  content?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface Financial {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category?: string
  date: string
  case_id?: string
  client_id?: string
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