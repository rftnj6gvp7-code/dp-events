import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Camera } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PastEventsPage() {
  const supabase = createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(user_id), event_photos(count)')
    .lt('date', new Date().toISOString().split('T')[0])
    .eq('is_cancelled', false)
    .order('date', { ascending: false })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Événements passés</h1>
        <p className="text-sm text-gray-500 mt-1">{events?.length || 0} événement(s)</p>
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p>Aucun événement passé.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events?.map((event: any) => {
          const count = event.registrations?.length || 0
          const photoCount = event.event_photos?.[0]?.count || 0

          return (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}
              className="card overflow-hidden group hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
              <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {event.cover_url ? (
                  <Image src={event.cover_url} alt={event.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">📅</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                  <span className={`badge ${(CATEGORY_COLORS as any)[event.category]}`}>
                    {(CATEGORY_LABELS as any)[event.category]}
                  </span>
                  {photoCount > 0 && (
                    <span className="badge bg-white/80 text-gray-700">
                      <Camera size={10} className="mr-1" />{photoCount} photo{photoCount > 1 ? 's' : ''}
                    </span>
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
                    {format(new Date(`${event.date}T${event.time}`), "EEEE d MMMM yyyy", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    {event.location}
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