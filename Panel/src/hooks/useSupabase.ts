import { useState, useEffect } from 'react'
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase'
import type { Case, Client, Appointment, Document, LegalResearch, Financial } from '../lib/supabase'

export const useSupabase = () => {
  const [cases, setCases] = useState<Case[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [legalResearch, setLegalResearch] = useState<LegalResearch[]>([])
  const [financials, setFinancials] = useState<Financial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [{ data: cData, error: cErr }, { data: clData, error: clErr }, { data: aData, error: aErr }] = await Promise.all([
          dbSelect('cases'),
          dbSelect('clients'),
          dbSelect('appointments'),
        ])
        if (cErr || clErr || aErr) throw new Error((cErr||clErr||aErr)?.message || 'Veri yüklenemedi')
        setCases(cData)
        setClients(clData)
        setAppointments(aData)
        // Optional tables; ignore errors but log
        const [docs, research, fins] = await Promise.all([
          dbSelect('documents').catch(() => ({ data: [] as Document[], error: null })),
          dbSelect('legal_research').catch(() => ({ data: [] as LegalResearch[], error: null })),
          dbSelect('financials').catch(() => ({ data: [] as Financial[], error: null })),
        ])
        setDocuments(docs.data)
        setLegalResearch(research.data)
        setFinancials(fins.data)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Başlangıç verileri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // CRUD Operations for Cases
  const addCase = async (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await dbInsert('cases', caseData as any)
    if (error) throw error
    if (data) setCases(prev => [data, ...prev])
    return data as Case
  }

  const updateCase = async (id: number, updates: Partial<Case>) => {
    const { data, error } = await dbUpdate('cases', id, updates as any)
    if (error) throw error
    if (data) setCases(prev => prev.map(c => c.id === id ? data as Case : c))
    return data as Case
  }

  const deleteCase = async (id: number) => {
    const { error } = await dbDelete('cases', id)
    if (error) throw error
    setCases(prev => prev.filter(c => c.id !== id))
  }

  const duplicateCase = async (id: number) => {
    const original = cases.find(c => c.id === id)
    if (!original) throw new Error('Dava bulunamadı')
    const clone = { ...original, id: undefined, title: `${original.title} (Kopya)` } as unknown as Omit<Case,'id'|'created_at'|'updated_at'>
    const { data, error } = await dbInsert('cases', clone as any)
    if (error) throw error
    if (data) setCases(prev => [data as Case, ...prev])
    return data as Case
  }

  const restoreCase = async (caseData: Case) => {
    const { data, error } = await dbInsert('cases', { ...caseData, id: undefined } as any)
    if (error) throw error
    if (data) setCases(prev => [data as Case, ...prev])
    return data as Case
  }

  // CRUD Operations for Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await dbInsert('clients', clientData as any)
    if (error) throw error
    if (data) setClients(prev => [data as Client, ...prev])
    return data as Client
  }

  const updateClient = async (id: number, updates: Partial<Client>) => {
    const { data, error } = await dbUpdate('clients', id, updates as any)
    if (error) throw error
    if (data) setClients(prev => prev.map(c => c.id === id ? data as Client : c))
    return data as Client
  }

  const deleteClient = async (id: number) => {
    const { error } = await dbDelete('clients', id)
    if (error) throw error
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const restoreClient = async (clientData: Client) => {
    const { data, error } = await dbInsert('clients', { ...clientData, id: undefined } as any)
    if (error) throw error
    if (data) setClients(prev => [data as Client, ...prev])
    return data as Client
  }

  // CRUD Operations for Appointments
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await dbInsert('appointments', appointmentData as any)
    if (error) throw error
    if (data) setAppointments(prev => [data as Appointment, ...prev])
    return data as Appointment
  }

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    const { data, error } = await dbUpdate('appointments', id, updates as any)
    if (error) throw error
    if (data) setAppointments(prev => prev.map(a => a.id === id ? data as Appointment : a))
    return data as Appointment
  }

  const deleteAppointment = async (id: number) => {
    const { error } = await dbDelete('appointments', id)
    if (error) throw error
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  return {
    // Data
    cases,
    clients,
    appointments,
    documents,
    legalResearch,
    financials,
    loading,
    error,

    // Case methods
    addCase,
    updateCase,
    deleteCase,
    duplicateCase,
    restoreCase,

    // Client methods
    addClient,
    updateClient,
    deleteClient,
    restoreClient,

    // Appointment methods
    addAppointment,
    updateAppointment,
    deleteAppointment,
  }
}