'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { toast.error('Minimum 6 caractères.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error('Erreur lors de la réinitialisation.')
    } else {
      toast.success('Mot de passe mis à jour !')
      router.push('/dashboard')
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
          <p className="text-sm text-gray-500">Nouveau mot de passe</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6 caractères minimum" required />
            </div>
            <div>
              <label className="label">Confirmer</label>
              <input className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex">
              {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
