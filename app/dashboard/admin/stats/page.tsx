import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CATEGORY_LABELS } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Stats globales
  const [
    { count: totalEvents },
    { count: totalUsers },
    { count: totalRegistrations },
    { data: events },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*, registrations(count)').eq('is_cancelled', false).order('date', { ascending: true }),
  ])

  // Événements triés par popularité
  const eventsByPopularity = [...(events || [])].sort((a, b) => {
    const aCount = (a.registrations as any)?.[0]?.count || 0
    const bCount = (b.registrations as any)?.[0]?.count || 0
    return bCount - aCount
  }).slice(0, 5)

  // Événements à venir
  const today = new Date().toISOString().split('T')[0]
  const upcoming = (events || []).filter(e => e.date >= today).slice(0, 5)

  const stats = [
    { label: 'Événements', value: totalEvents || 0, emoji: '📅', color: 'bg-blue-50 text-blue-700' },
    { label: 'Membres actifs', value: totalUsers || 0, emoji: '👥', color: 'bg-green-50 text-green-700' },
    { label: 'Inscriptions', value: totalRegistrations || 0, emoji: '✅', color: 'bg-purple-50 text-purple-700' },
    { label: 'Taux moyen', value: totalEvents ? Math.round((totalRegistrations || 0) / totalEvents) + '/event' : '0', emoji: '📊', color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Statistiques</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${s.color} text-xl mb-2`}>
              {s.emoji}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Événements les plus populaires */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">🏆 Les plus populaires</h2>
          <div className="space-y-3">
            {eventsByPopularity.length === 0 && <p className="text-sm text-gray-400">Aucun événement.</p>}
            {eventsByPopularity.map((e, i) => {
              const count = (e.registrations as any)?.[0]?.count || 0
              const pct = e.max_attendees > 0 ? Math.round((count / e.max_attendees) * 100) : 0
              return (
                <Link key={e.id} href={`/dashboard/events/${e.id}`} className="block">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{count}/{e.max_attendees}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Prochains événements */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📅 Prochains événements</h2>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-gray-400">Aucun événement à venir.</p>}
            {upcoming.map(e => {
              const count = (e.registrations as any)?.[0]?.count || 0
              return (
                <Link key={e.id} href={`/dashboard/events/${e.id}`} className="flex items-center gap-3 group">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color || '#003F8A' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-brand-600">{e.title}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(`${e.date}T${e.time}`), "d MMM 'à' HH'h'mm", { locale: fr })} · {count} inscrits
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{(CATEGORY_LABELS as any)[e.category]}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}