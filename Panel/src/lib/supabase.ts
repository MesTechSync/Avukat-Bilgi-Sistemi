import { createClient } from '@supabase/supabase-js'

// Demo mode için mock Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Mock Supabase client for demo purposes
const createMockSupabaseClient = () => {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: Date.now(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, error: null })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: value, ...data, updated_at: new Date().toISOString() }, error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ error: null })
      })
    })
  }
}

export const supabase = import.meta.env.VITE_SUPABASE_URL ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  createMockSupabaseClient() as any

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