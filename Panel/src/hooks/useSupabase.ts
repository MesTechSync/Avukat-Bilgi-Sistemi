import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

  // Initial data fetch from Supabase
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        // Cases tablosu
        try {
          const { data: caseData, error: caseError } = await supabase.from('cases').select('*')
          if (caseError) {
            console.error('Cases tablosu hatası:', caseError)
          } else {
            setCases(caseData || [])
            console.log('✅ Cases tablosu başarılı:', caseData?.length || 0, 'kayıt')
          }
        } catch (err) {
          console.error('Cases tablosu bağlantı hatası:', err)
        }

        // Clients tablosu
        try {
          const { data: clientData, error: clientError } = await supabase.from('clients').select('*')
          if (clientError) {
            console.error('Clients tablosu hatası:', clientError)
          } else {
            setClients(clientData || [])
            console.log('✅ Clients tablosu başarılı:', clientData?.length || 0, 'kayıt')
          }
        } catch (err) {
          console.error('Clients tablosu bağlantı hatası:', err)
        }

        // Appointments tablosu (opsiyonel - tablo mevcut değilse sessizce geç)
        try {
          const { data: appointmentData, error: appointmentError } = await supabase.from('appointments').select('*')
          if (appointmentError) {
            // Tablo mevcut değilse sessizce geç, sadece debug için log
            if (appointmentError.message.includes('Could not find the table') || 
                appointmentError.message.includes('relation') ||
                appointmentError.code === '42P01') {
              console.log('Appointments tablosu mevcut değil (normal):', appointmentError.message)
            } else {
              console.error('Appointments tablosu hatası:', appointmentError)
            }
          } else {
            setAppointments(appointmentData || [])
            console.log('✅ Appointments tablosu başarılı:', appointmentData?.length || 0, 'kayıt')
          }
        } catch (err) {
          console.log('Appointments tablosu bağlantı hatası (normal):', err)
        }

        // Financials tablosu
        try {
          const { data: financialData, error: financialError } = await supabase.from('financials').select('*')
          if (financialError) {
            console.error('Financials tablosu hatası:', financialError)
          } else {
            setFinancials(financialData || [])
            console.log('✅ Financials tablosu başarılı:', financialData?.length || 0, 'kayıt')
          }
        } catch (err) {
          console.error('Financials tablosu bağlantı hatası:', err)
        }

        setError(null)
      } catch (err) {
        console.error('Genel Supabase hatası:', err)
        setError('Supabase veri çekme hatası')
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  // CRUD Operations for Cases
  const addCase = async (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Supabase addCase çağrıldı:', caseData);
      
      // Mock user_id for now - in real app this would come from auth
      const dataToInsert = {
        title: caseData.title,
        case_type: caseData.case_type,
        status: caseData.status,
        priority: caseData.priority,
        amount: caseData.amount ? parseFloat(caseData.amount.toString()) : null,
        description: caseData.description,
        deadline: caseData.deadline || null,
        client_name: caseData.client_name,
        user_id: null // Foreign key constraint'i bypass etmek için
      };
      
      console.log('Supabase\'e gönderilecek veri:', dataToInsert);
      const { data, error } = await supabase.from('cases').insert([dataToInsert]).select()
      
      if (error) {
        console.error('Supabase hatası:', error);
        throw new Error(`Supabase hatası: ${error.message}`);
      }
      
      console.log('Supabase\'den dönen veri:', data);
      setCases(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      console.error('addCase hatası:', err);
      setError(err instanceof Error ? err.message : 'Dava eklenirken hata oluştu')
      throw err
    }
  }

  const updateCase = async (id: string, updates: Partial<Case>) => {
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

  const deleteCase = async (id: string) => {
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
      // Mock user_id for now - in real app this would come from auth
      const dataToInsert = {
        ...clientData,
        user_id: null // Foreign key constraint'i bypass etmek için
      };
      const { data, error } = await supabase.from('clients').insert([dataToInsert]).select()
      if (error) throw error
      setClients(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Müvekkil eklenirken hata oluştu')
      throw err
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
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

  const deleteClient = async (id: string) => {
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
      const { data, error } = await supabase.from('appointments').insert([{ ...appointmentData }]).select()
      if (error) throw error
      setAppointments(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu eklenirken hata oluştu')
      throw err
    }
  }

  const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase.from('appointments').update({ ...updates }).eq('id', id).select()
      if (error) throw error
      setAppointments(prev => prev.map(a => a.id === id ? data[0] : a))
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteAppointment = async (id: number) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu silinirken hata oluştu')
      throw err
    }
  }

  // CRUD Operations for Financials
  const addFinancial = async (financialData: Omit<Financial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Supabase addFinancial çağrıldı:', financialData);
      
      // Mock user_id for now - in real app this would come from auth
      const dataToInsert = {
        ...financialData,
        user_id: null // Foreign key constraint'i bypass etmek için
      };
      
      console.log('Supabase\'e gönderilecek financial veri:', dataToInsert);
      const { data, error } = await supabase.from('financials').insert([dataToInsert]).select()
      
      if (error) {
        console.error('Supabase financial hatası:', error);
        throw new Error(`Supabase hatası: ${error.message}`);
      }
      
      console.log('Supabase\'den dönen financial veri:', data);
      setFinancials(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      console.error('addFinancial hatası:', err);
      setError(err instanceof Error ? err.message : 'Mali işlem eklenirken hata oluştu')
      throw err
    }
  }

  const updateFinancial = async (id: string, updates: Partial<Financial>) => {
    try {
      const { data, error } = await supabase.from('financials').update({ ...updates }).eq('id', id).select()
      if (error) throw error
      setFinancials(prev => prev.map(f => f.id === id ? data[0] : f))
      return data[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mali işlem güncellenirken hata oluştu')
      throw err
    }
  }

  const deleteFinancial = async (id: string) => {
    try {
      const { error } = await supabase.from('financials').delete().eq('id', id)
      if (error) throw error
      setFinancials(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mali işlem silinirken hata oluştu')
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
    
    // Setters
    setCases,
    setClients,
    setFinancials,
    
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
    deleteAppointment,
    
    // Financial methods
    addFinancial,
    updateFinancial,
    deleteFinancial
  }
}