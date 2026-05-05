'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 6) { toast.error('Le mot de passe doit faire au moins 6 caractères.'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'user' } }
    })

    if (error) {
      toast.error(error.message)
    } else {
      // Send pending email via API
      await fetch('/api/auth/notify-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.fullName })
      })
      setDone(true)
    }
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-semibold mb-2">Demande envoyée !</h2>
        <p className="text-sm text-gray-500 mb-4">
          Un administrateur va examiner votre demande. Vous recevrez un email dès que votre compte sera activé.
        </p>
        <Link href="/auth/login" className="btn-secondary inline-block">Retour à la connexion</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-brand-600" />
            <span className="text-xl font-semibold tracking-tight">DP Events</span>
          </div>
          <p className="text-sm text-gray-500">Créer un compte</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nom complet</label>
              <input className="input" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="Prénom Nom" required />
            </div>
            <div>
              <label className="label">Email institutionnel</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vous@dp.lu" required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="6 caractères minimum" required />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input className="input" type="password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
              {loading ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
