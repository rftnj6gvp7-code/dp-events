import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import UserActions from '@/components/admin/UserActions'
import AddUserModal from '@/components/admin/AddUserModal'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATE_LOCALES: Record<string, any> = { fr, en: enUS, de, lu: fr }

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Gestion des utilisateurs', accounts: 'compte(s)', pending: 'en attente', pendingTitle: 'Demandes en attente de validation', allMembers: 'Tous les membres', noUsers: 'Aucun utilisateur.', addUser: 'Ajouter un utilisateur', active: 'Actif', pendingStatus: 'En attente', rejected: 'Refusé', admin: 'Administrateur', user: 'Utilisateur', you: 'vous' },
  en: { title: 'User Management', accounts: 'account(s)', pending: 'pending', pendingTitle: 'Pending validation requests', allMembers: 'All members', noUsers: 'No users.', addUser: 'Add user', active: 'Active', pendingStatus: 'Pending', rejected: 'Rejected', admin: 'Administrator', user: 'User', you: 'you' },
  de: { title: 'Benutzerverwaltung', accounts: 'Konto/Konten', pending: 'ausstehend', pendingTitle: 'Ausstehende Validierungsanfragen', allMembers: 'Alle Mitglieder', noUsers: 'Keine Benutzer.', addUser: 'Benutzer hinzufügen', active: 'Aktiv', pendingStatus: 'Ausstehend', rejected: 'Abgelehnt', admin: 'Administrator', user: 'Benutzer', you: 'Sie' },
  lu: { title: 'Benotzerverwaltung', accounts: 'Kont(en)', pending: 'am Gaang', pendingTitle: 'Ufroe fir Validéierung', allMembers: 'All Memberen', noUsers: 'Keng Benotzer.', addUser: 'Benotzer dobäisetzen', active: 'Aktiv', pendingStatus: 'Am Gaang', rejected: 'Refuséiert', admin: 'Administrateur', user: 'Benotzer', you: 'Dir' },
}

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (currentProfile?.role !== 'admin') redirect('/dashboard')

  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const pending = profiles?.filter(p => p.status === 'pending') || []
  const others = profiles?.filter(p => p.status !== 'pending') || []

  const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  const STATUS_LABELS: Record<string, string> = {
    active: t.active, pending: t.pendingStatus, rejected: t.rejected
  }

  function UserCard({ p }: { p: any }) {
    const initials = p.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    return (
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate dark:text-white">
                {p.full_name} {p.id === user!.id ? <span className="text-xs text-gray-400 dark:text-gray-500">({t.you})</span> : null}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{p.role === 'admin' ? t.admin : t.user}</span>
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
    <div className="p-4 md:p-6 dark:bg-gray-950 min-h-screen">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold dark:text-white">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profiles?.length || 0} {t.accounts} · {pending.length} {t.pending}</p>
        </div>
        <AddUserModal />
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full px-2 py-0.5">{pending.length}</span>
            {t.pendingTitle}
          </h2>
          <div className="space-y-3">
            {pending.map(p => <UserCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.allMembers}</h2>
        <div className="space-y-3">
          {others.map(p => <UserCard key={p.id} p={p} />)}
          {others.length === 0 && <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">{t.noUsers}</div>}
        </div>
      </div>
    </div>
  )
}