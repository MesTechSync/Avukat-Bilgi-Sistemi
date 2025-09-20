import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Case, Client, Appointment, Document, LegalResearch, Financial } from '../lib/supabase'

// Mock data for demo purposes
const mockClients: Client[] = [
  {
    id: 1,
  // Demo veri kaldırıldı
  },
  {
    id: 2,
  // Demo veri kaldırıldı
  },
  {
    id: 3,
    name: 'Ali Kaya',
    email: 'ali@email.com',
    phone: '0554 456 7890',
    company: 'Bireysel',
    address: 'İzmir, Türkiye',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

const mockCases: Case[] = [
  {
    id: 1,
    title: 'Ticari Dava - Şirket A',
    client_id: 1,
    case_type: 'Ticari',
    status: 'Devam Ediyor',
    deadline: '2024-12-15',
    priority: 'Yüksek',
    amount: '150000',
    description: 'Sözleşme ihlali nedeniyle açılan ticari dava',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'İş Mahkemesi - İşçi Hakları',
    client_id: 2,
    case_type: 'İş Hukuku',
    status: 'İnceleme',
    deadline: '2024-11-20',
    priority: 'Orta',
    amount: '75000',
    description: 'İşten çıkarma tazminatı davası',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    title: 'Boşanma Davası',
    client_id: 3,
    case_type: 'Aile Hukuku',
    status: 'Beklemede',
    deadline: '2025-01-10',
    priority: 'Düşük',
    amount: '25000',
    description: 'Anlaşmalı boşanma süreci',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: 'Müvekkil Görüşmesi - Mehmet Yılmaz',
    date: '2024-10-15',
    time: '10:00',
    type: 'Görüşme',
    status: 'Planlandı',
    client_id: 1,
    case_id: 1,
    description: 'Dava süreci hakkında bilgilendirme',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Mahkeme Duruşması - Ticari Dava',
    date: '2024-10-18',
    time: '14:00',
    type: 'Duruşma',
    status: 'Onaylandı',
    client_id: 1,
    case_id: 1,
    description: 'İlk duruşma',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

const mockDocuments: Document[] = []
const mockLegalResearch: LegalResearch[] = []
const mockFinancials: Financial[] = [
  {
    id: 1,
    type: 'income',
    amount: '50000',
    description: 'Ticari Dava Avukatlık Ücreti',
    category: 'Avukatlık Ücreti',
    date: '2024-10-01',
    case_id: 1,
    client_id: 1,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-01T00:00:00Z'
  },
  {
    id: 2,
    type: 'income',
    amount: '25000',
    description: 'İş Mahkemesi Danışmanlık',
    category: 'Danışmanlık',
    date: '2024-10-05',
    case_id: 2,
    client_id: 2,
    created_at: '2024-10-05T00:00:00Z',
    updated_at: '2024-10-05T00:00:00Z'
  }
]

export const useSupabase = () => {
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [legalResearch, setLegalResearch] = useState<LegalResearch[]>(mockLegalResearch)
  const [financials, setFinancials] = useState<Financial[]>(mockFinancials)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate initial data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading delay
      setTimeout(() => {
        setLoading(false)
        setError(null)
      }, 1000)
    }
    
    loadData()
  }, [])

  // CRUD Operations for Cases
  const addCase = async (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = {
        ...caseData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setCases(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava eklenirken hata oluştu')
      throw err
    }
  }

  const updateCase = async (id: number, updates: Partial<Case>) => {
    try {
      const data = {
        ...cases.find(c => c.id === id),
        ...updates,
        id,
        updated_at: new Date().toISOString()
      }
      setCases(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteCase = async (id: number) => {
    try {
      setCases(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dava silinirken hata oluştu')
      throw err
    }
  }

  // CRUD Operations for Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = {
        ...clientData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setClients(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil eklenirken hata oluştu')
      throw err
    }
  }

  const updateClient = async (id: number, updates: Partial<Client>) => {
    try {
      const data = {
        ...clients.find(c => c.id === id),
        ...updates,
        id,
        updated_at: new Date().toISOString()
      }
      setClients(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteClient = async (id: number) => {
    try {
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
    
    // Appointment methods
    addAppointment,
    updateAppointment,
    deleteAppointment
  }
}