import React, { useState } from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl p-8">
        {mode === 'login' ? (
          <Login onSuccess={() => window.location.reload()} switchToRegister={() => setMode('register')} />
        ) : (
          <Register onSuccess={() => {}} switchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
