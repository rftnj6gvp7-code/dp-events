import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, CATEGORY_COLORS, Event } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      registrations(user_id),
      registration_count:registrations(count)
    `)
    .eq('is_cancelled', false)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  const { data: myRegistrations } = await supabase
    .from('registrations')
    .select('event_id')
    .eq('user_id', user!.id)

  const myEventIds = new Set((myRegistrations || []).map(r => r.event_id))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Événements à venir</h1>
        <p className="text-sm text-gray-500 mt-1">Inscrivez-vous aux événements qui vous intéressent</p>
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p>Aucun événement à venir pour le moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {events?.map((event: Event & { registrations: { user_id: string }[] }) => {
          const count = event.registrations?.length || 0
          const isFull = count >= event.max_attendees
          const isRegistered = myEventIds.has(event.id)
          const spotsLeft = event.max_attendees - count

          return (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}
              className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-36 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
                {event.cover_url ? (
                  <Image src={event.cover_url} alt={event.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📅</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                  <span className={`badge ${CATEGORY_COLORS[event.category]}`}>
                    {CATEGORY_LABELS[event.category]}
                  </span>
                  {isRegistered && <span className="badge bg-green-500 text-white">✓ Inscrit</span>}
                  {isFull && !isRegistered && <span className="badge bg-red-100 text-red-700">Complet</span>}
                  {!isFull && spotsLeft <= 5 && !isRegistered && (
                    <span className="badge bg-orange-100 text-orange-700">{spotsLeft} places</span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-1">
                  {event.title}
                </h2>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {format(new Date(`${event.date}T${event.time}`), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} />
                    {count} / {event.max_attendees} inscrits
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
