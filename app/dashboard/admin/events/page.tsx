import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CATEGORY_LABELS } from '@/types'
import EventFormModal from '@/components/admin/EventFormModal'
import DeleteEventButton from '@/components/admin/DeleteEventButton'
import Link from 'next/link'

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des événements</h1>
          <p className="text-sm text-gray-500 mt-1">{events?.length || 0} événement(s)</p>
        </div>
        <EventFormModal mode="create" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Titre</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Lieu</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Catégorie</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Inscrits</th>
              <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {events?.map(event => {
              const count = (event.registration_count as any)?.[0]?.count || 0
              return (
                <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color || '#7c3aed' }} />
                      <Link href={`/dashboard/events/${event.id}`} className="font-medium text-sm hover:text-brand-600 transition-colors">
                        {event.title}
                      </Link>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {format(new Date(`${event.date}T${event.time}`), "d MMM yyyy", { locale: fr })}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{event.location}</td>
                  <td className="p-4">
                    <span className="text-xs text-gray-600">{CATEGORY_LABELS[event.category as EventCategory]}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{count} / {event.max_attendees}</td>
                  <td className="p-4">
                    {event.is_cancelled
                      ? <span className="badge bg-red-100 text-red-700">Annulé</span>
                      : <span className="badge bg-green-100 text-green-700">Actif</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <EventFormModal mode="edit" event={event} />
                      <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun événement créé.</div>
        )}
      </div>
    </div>
  )
}
