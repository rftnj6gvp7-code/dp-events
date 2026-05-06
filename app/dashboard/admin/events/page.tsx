import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CATEGORY_LABELS } from '@/types'
import EventFormModal from '@/components/admin/EventFormModal'
import DeleteEventButton from '@/components/admin/DeleteEventButton'
import ExportEventsButton from '@/components/admin/ExportEventsButton'
import ImportEventsButton from '@/components/admin/ImportEventsButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: events } = await supabase
    .from('events')
    .select('*, registration_count:registrations(count)')
    .order('date', { ascending: true })

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Gestion des événements</h1>
          <p className="text-sm text-gray-500 mt-1">{events?.length || 0} événement(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportEventsButton events={events || []} />
          <ImportEventsButton />
          <EventFormModal mode="create" />
        </div>
      </div>

      <div className="space-y-3">
        {events?.map(event => {
          const count = (event.registration_count as any)?.[0]?.count || 0
          return (
            <div key={event.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: event.color || '#003F8A' }} />
                  <div className="min-w-0">
                    <Link href={`/dashboard/events/${event.id}`} className="font-medium text-sm hover:text-brand-600 transition-colors block truncate">
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(`${event.date}T${event.time}`), "d MMM yyyy 'à' HH'h'mm", { locale: fr })} · {event.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400">{(CATEGORY_LABELS as any)[event.category]}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{count}/{event.max_attendees} inscrits</span>
                      {event.is_cancelled && <span className="badge bg-red-100 text-red-700">Annulé</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <EventFormModal mode="edit" event={event} />
                  <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                </div>
              </div>
            </div>
          )
        })}
        {(!events || events.length === 0) && (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun événement créé.</div>
        )}
      </div>
    </div>
  )
}