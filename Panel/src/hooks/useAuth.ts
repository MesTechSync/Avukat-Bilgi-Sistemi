import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    const init = async () => {
      try {
        // get current user/session
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        setUser(data.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth başlatma hatası')
        setUser(null)
      } finally {
        setLoading(false)
      }

      // subscribe to auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      }) as any

      unsub = () => listener?.subscription?.unsubscribe?.()
    }

    init()
    return () => {
      unsub?.()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çıkış yapılırken hata oluştu')
    }
  }

  return { user, loading, error, signOut }
}
