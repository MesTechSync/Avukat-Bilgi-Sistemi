import React, { useState } from 'react'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface LoginProps {
  onSuccess?: () => void
  switchToRegister?: () => void
}

export default function Login({ onSuccess, switchToRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-6">
      <div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Giriş Yap</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Hesabınız yok mu?{' '}
          <button type="button" onClick={switchToRegister} className="text-blue-600 hover:underline">Kayıt Ol</button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
          </div>
        )}
        <div>
          <label className="sr-only">E-posta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="sr-only">Şifre</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Giriş Yap
        </button>
      </form>
    </div>
  )
}
