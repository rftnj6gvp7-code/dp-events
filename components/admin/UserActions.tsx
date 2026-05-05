'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Profile } from '@/types'

export default function UserActions({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function action(type: string) {
    setLoading(type)
    const res = await fetch('/api/users/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id, action: type, email: profile.email, name: profile.full_name })
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error || 'Erreur')
    else {
      const msgs: Record<string, string> = {
        approve: 'Compte validé !',
        reject: 'Demande refusée.',
        make_admin: 'Rôle admin accordé.',
        make_user: 'Rôle utilisateur rétabli.',
        delete: 'Utilisateur supprimé.',
      }
      toast.success(msgs[type] || 'Action effectuée.')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {profile.status === 'pending' && <>
        <button onClick={() => action('approve')} disabled={!!loading}
          className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors">
          {loading === 'approve' ? '…' : '✓ Valider'}
        </button>
        <button onClick={() => action('reject')} disabled={!!loading}
          className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors">
          {loading === 'reject' ? '…' : '✗ Refuser'}
        </button>
      </>}
      {profile.status === 'active' && profile.role === 'user' && (
        <button onClick={() => action('make_admin')} disabled={!!loading}
          className="text-xs px-2 py-1 rounded-md bg-brand-100 text-brand-700 hover:bg-brand-200 font-medium transition-colors">
          {loading === 'make_admin' ? '…' : 'Passer admin'}
        </button>
      )}
      {profile.role === 'admin' && (
        <button onClick={() => action('make_user')} disabled={!!loading}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">
          {loading === 'make_user' ? '…' : 'Rétrograder'}
        </button>
      )}
      <button onClick={() => action('delete')} disabled={!!loading}
        className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
        {loading === 'delete' ? '…' : 'Suppr.'}
      </button>
    </div>
  )
}
