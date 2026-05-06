'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Profile } from '@/types'

const TRANSLATIONS: Record<string, any> = {
  fr: { approve: '✓ Valider', reject: '✗ Refuser', makeAdmin: 'Passer admin', demote: 'Rétrograder', delete: 'Suppr.', approved: 'Compte validé !', rejected: 'Demande refusée.', madeAdmin: 'Rôle admin accordé.', madeUser: 'Rôle utilisateur rétabli.', deleted: 'Utilisateur supprimé.', error: 'Erreur' },
  en: { approve: '✓ Validate', reject: '✗ Reject', makeAdmin: 'Make admin', demote: 'Demote', delete: 'Delete', approved: 'Account validated!', rejected: 'Request rejected.', madeAdmin: 'Admin role granted.', madeUser: 'User role restored.', deleted: 'User deleted.', error: 'Error' },
  de: { approve: '✓ Bestätigen', reject: '✗ Ablehnen', makeAdmin: 'Admin machen', demote: 'Herabstufen', delete: 'Löschen', approved: 'Konto bestätigt!', rejected: 'Anfrage abgelehnt.', madeAdmin: 'Admin-Rolle vergeben.', madeUser: 'Benutzerrolle wiederhergestellt.', deleted: 'Benutzer gelöscht.', error: 'Fehler' },
  lu: { approve: '✓ Validéieren', reject: '✗ Refuséieren', makeAdmin: 'Admin maachen', demote: 'Erofsetzen', delete: 'Läschen', approved: 'Kont validéiert!', rejected: 'Ufro refuséiert.', madeAdmin: 'Admin-Roll verginn.', madeUser: 'Benotzerroll restauréiert.', deleted: 'Benotzer geläscht.', error: 'Feeler' },
}

export default function UserActions({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const locale = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1] || 'fr'
    : 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function action(type: string) {
    setLoading(type)
    const res = await fetch('/api/users/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: profile.id, action: type, email: profile.email, name: profile.full_name })
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error || t.error)
    else {
      const msgs: Record<string, string> = { approve: t.approved, reject: t.rejected, make_admin: t.madeAdmin, make_user: t.madeUser, delete: t.deleted }
      toast.success(msgs[type] || 'OK')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {profile.status === 'pending' && <>
        <button onClick={() => action('approve')} disabled={!!loading} className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors">
          {loading === 'approve' ? '…' : t.approve}
        </button>
        <button onClick={() => action('reject')} disabled={!!loading} className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors">
          {loading === 'reject' ? '…' : t.reject}
        </button>
      </>}
      {profile.status === 'active' && profile.role === 'user' && (
        <button onClick={() => action('make_admin')} disabled={!!loading} className="text-xs px-2 py-1 rounded-md bg-brand-100 text-brand-700 hover:bg-brand-200 font-medium transition-colors">
          {loading === 'make_admin' ? '…' : t.makeAdmin}
        </button>
      )}
      {profile.role === 'admin' && (
        <button onClick={() => action('make_user')} disabled={!!loading} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">
          {loading === 'make_user' ? '…' : t.demote}
        </button>
      )}
      <button onClick={() => action('delete')} disabled={!!loading} className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
        {loading === 'delete' ? '…' : t.delete}
      </button>
    </div>
  )
}