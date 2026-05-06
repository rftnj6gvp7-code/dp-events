import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import UserActions from '@/components/admin/UserActions'
import AddUserModal from '@/components/admin/AddUserModal'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (currentProfile?.role !== 'admin') redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = profiles?.filter(p => p.status === 'pending') || []
  const others = profiles?.filter(p => p.status !== 'pending') || []

  const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const STATUS_LABELS: Record<string, string> = {
    active: 'Actif', pending: 'En attente', rejected: 'Refusé'
  }

  function UserCard({ p }: { p: any }) {
    const initials = p.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    return (
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {p.full_name} {p.id === user!.id ? <span className="text-xs text-gray-400">(vous)</span> : null}
              </p>
              <p className="text-xs text-gray-400 truncate">{p.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                <span className="text-xs text-gray-400">{p.role === 'admin' ? 'Admin' : 'Utilisateur'}</span>
              </div>
            </div>
          </div>
          {p.id !== user!.id && (
            <div className="shrink-0">
              <UserActions profile={p} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles?.length || 0} compte(s) · {pending.length} en attente</p>
        </div>
        <AddUserModal />
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">{pending.length}</span>
            En attente de validation
          </h2>
          <div className="space-y-3">
            {pending.map(p => <UserCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Tous les membres</h2>
        <div className="space-y-3">
          {others.map(p => <UserCard key={p.id} p={p} />)}
          {others.length === 0 && <div className="text-center py-8 text-sm text-gray-400">Aucun utilisateur.</div>}
        </div>
      </div>
    </div>
  )
}