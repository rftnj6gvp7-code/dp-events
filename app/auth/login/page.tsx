'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email ou mot de passe incorrect.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error('Erreur lors de l\'envoi.')
    } else {
      toast.success('Email de réinitialisation envoyé !')
      setForgotMode(false)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-brand-600" />
            <span className="text-xl font-semibold tracking-tight">DP Events</span>
          </div>
          <p className="text-sm text-gray-500">
            {forgotMode ? 'Réinitialiser le mot de passe' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <div className="card p-6">
          {forgotMode ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@dp.lu" required />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center flex">
                {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
              </button>
              <button type="button" onClick={() => setForgotMode(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                ← Retour à la connexion
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@dp.lu" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Mot de passe</label>
                  <button type="button" onClick={() => setForgotMode(true)}
                    className="text-xs text-brand-600 hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
                <input className="input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center flex">
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-brand-600 hover:underline font-medium">
              Faire une demande
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}