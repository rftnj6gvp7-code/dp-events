'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loadingName, setLoadingName] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setLoadingName(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user!.id)
    if (error) toast.error('Erreur lors de la mise à jour.')
    else { toast.success('Nom mis à jour !'); router.refresh() }
    setLoadingName(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { toast.error('Minimum 6 caractères.'); return }
    setLoadingPw(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) toast.error('Erreur lors de la mise à jour.')
    else toast.success('Mot de passe mis à jour !')
    setPassword('')
    setConfirm('')
    setLoadingPw(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-1">Gérer vos informations personnelles</p>
      </div>

      {/* Nom */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Modifier le nom</h2>
        <form onSubmit={handleUpdateName} className="space-y-3">
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Prénom Nom" required />
          </div>
          <button type="submit" disabled={loadingName} className="btn-primary">
            {loadingName ? 'Mise à jour…' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Mot de passe */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Changer le mot de passe</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-3">
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
          <button type="submit" disabled={loadingPw} className="btn-primary">
            {loadingPw ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}