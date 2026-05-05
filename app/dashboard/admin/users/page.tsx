import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import UserActions from '@/components/admin/UserActions'
import AddUserModal from '@/components/admin/AddUserModal'

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

  function UserRow({ p, currentUserId }: { p: any; currentUserId: string }) {
    const initials = p.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    return (
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium">{p.full_name} {p.id === currentUserId ? <span className="text-xs text-gray-400">(vous)</span> : null}</p>
              <p className="text-xs text-gray-400">{p.email}</p>
            </div>
          </div>
        </td>
        <td className="p-4 text-xs text-gray-500 capitalize">{p.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</td>
        <td className="p-4">
          <span className={`badge ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[p.status] || p.status}
          </span>
        </td>
        <td className="p-4 text-xs text-gray-400">
          {format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}
        </td>
        <td className="p-4">
          {p.id !== currentUserId && <UserActions profile={p} />}
        </td>
      </tr>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles?.length || 0} compte(s) · {pending.length} en attente</p>
        </div>
        <AddUserModal />
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">{pending.length}</span>
            Demandes en attente de validation
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-yellow-50/50">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Rôle</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Inscrit le</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map(p => <UserRow key={p.id} p={p} currentUserId={user!.id} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Tous les membres</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Rôle</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Inscrit le</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {others.map(p => <UserRow key={p.id} p={p} currentUserId={user!.id} />)}
            </tbody>
          </table>
          {others.length === 0 && <div className="text-center py-8 text-sm text-gray-400">Aucun utilisateur.</div>}
        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
