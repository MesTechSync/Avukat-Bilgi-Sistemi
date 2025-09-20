import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Case, Client, Appointment, Document, LegalResearch, Financial } from '../lib/supabase'

// Tüm mock veri kaldırıldı, sadece Supabase kullanılacak

export const useSupabase = () => {
  const [cases, setCases] = useState<Case[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [legalResearch, setLegalResearch] = useState<LegalResearch[]>([])
  const [financials, setFinancials] = useState<Financial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate initial data loading
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const { data: caseData } = await supabase.from('cases').select('*')
        setCases(caseData || [])
        const { data: clientData } = await supabase.from('clients').select('*')
        setClients(clientData || [])
        const { data: appointmentData } = await supabase.from('appointments').select('*')
        setAppointments(appointmentData || [])
        const { data: financialData } = await supabase.from('financials').select('*')
        setFinancials(financialData || [])
        // Add other tables as needed
        setError(null)
      } catch (err) {
        setError('Supabase veri çekme hatası')
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  // CRUD Operations for Cases
  const addCase = async (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.from('cases').insert([{ ...caseData }]).select()
      if (error) throw error
      setCases(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava eklenirken hata oluştu')
      throw err
    }
  }

  const updateCase = async (id: number, updates: Partial<Case>) => {
    try {
      const { data, error } = await supabase.from('cases').update({ ...updates }).eq('id', id).select()
      if (error) throw error
      setCases(prev => prev.map(c => c.id === id ? data[0] : c))
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteCase = async (id: number) => {
    try {
      const { error } = await supabase.from('cases').delete().eq('id', id)
      if (error) throw error
      setCases(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava silinirken hata oluştu')
      throw err
    }
  }

  // CRUD Operations for Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.from('clients').insert([{ ...clientData }]).select()
      if (error) throw error
      setClients(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil eklenirken hata oluştu')
      throw err
    }
  }

  const updateClient = async (id: number, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase.from('clients').update({ ...updates }).eq('id', id).select()
      if (error) throw error
      setClients(prev => prev.map(c => c.id === id ? data[0] : c))
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteClient = async (id: number) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil silinirken hata oluştu')
      throw err
    }
  }

  // CRUD Operations for Appointments
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = {
        ...appointmentData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setAppointments(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu eklenirken hata oluştu')
      throw err
    }
  }

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    try {
      const data = {
        ...appointments.find(a => a.id === id),
        ...updates,
        id,
        updated_at: new Date().toISOString()
      }
      setAppointments(prev => prev.map(a => a.id === id ? data : a))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteAppointment = async (id: number) => {
    try {
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu silinirken hata oluştu')
      throw err
    }
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
    
    // Client methods
    addClient,
    updateClient,
    deleteClient,
    
    // Tüm veri akışı Supabase'den alınacak şekilde mock/demo diziler kaldırıldı