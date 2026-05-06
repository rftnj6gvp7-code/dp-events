import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS_I18N, CATEGORY_COLORS } from '@/types'
import { format } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'
import EventFilters from '@/components/events/EventFilters'
import CalendarView from '@/components/events/CalendarView'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATE_LOCALES: Record<string, any> = { fr, en: enUS, de, lu: fr }

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Événements à venir', subtitle: 'Inscrivez-vous aux événements qui vous intéressent', noEvents: 'Aucun événement trouvé.', list: 'Liste', calendar: 'Calendrier', spots: 'places', full: 'Complet' },
  en: { title: 'Upcoming Events', subtitle: 'Register for events that interest you', noEvents: 'No events found.', list: 'List', calendar: 'Calendar', spots: 'spots', full: 'Full' },
  de: { title: 'Bevorstehende Veranstaltungen', subtitle: 'Melden Sie sich für interessante Veranstaltungen an', noEvents: 'Keine Veranstaltungen gefunden.', list: 'Liste', calendar: 'Kalender', spots: 'Plätze', full: 'Ausgebucht' },
  lu: { title: 'Komend Evenementer', subtitle: 'Mellt iech fir interessant Evenementer un', noEvents: 'Keng Evenementer fonnt.', list: 'Lëscht', calendar: 'Kalenner', spots: 'Plazen', full: 'Ausgebucht' },
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { category?: string; period?: string; mine?: string; q?: string; view?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr
  const dateLocale = DATE_LOCALES[locale] || fr

  let query = supabase
    .from('events')
    .select('*, registrations(user_id), event_photos(count)')
    .eq('is_cancelled', false)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (searchParams.category) query = query.eq('category', searchParams.category)

  if (searchParams.period === 'week') {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    query = query.lte('date', nextWeek.toISOString().split('T')[0])
  } else if (searchParams.period === 'month') {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    query = query.lte('date', nextMonth.toISOString().split('T')[0])
  }

  const { data: events } = await query

  const { data: myRegistrations } = await supabase
    .from('registrations')
    .select('event_id')
    .eq('user_id', user!.id)

  const myEventIds = new Set((myRegistrations || []).map(r => r.event_id))

  let filteredEvents = events || []
  if (searchParams.mine === 'true') {
    filteredEvents = filteredEvents.filter(e => myEventIds.has(e.id))
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase()
    filteredEvents = filteredEvents.filter(e =>
      e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    )
  }

  const isCalendarView = searchParams.view === 'calendar'
  const categoryLabels = CATEGORY_LABELS_I18N[locale] || CATEGORY_LABELS_I18N.fr

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredEvents.length} événement(s)</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Link href="?view=list"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!isCalendarView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            ☰ {t.list}
          </Link>
          <Link href="?view=calendar"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isCalendarView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            📅 {t.calendar}
          </Link>
        </div>
      </div>

      <EventFilters locale={locale} />

      {isCalendarView ? (
        <div className="mt-4">
          <CalendarView
            events={(events || []).map(e => ({
              id: e.id,
              title: e.title,
              date: e.date,
              color: e.color,
              category: e.category,
            }))}
            myEventIds={Array.from(myEventIds)}
          />
        </div>
      ) : (
        <>
          {filteredEvents.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📅</div>
              <p>{t.noEvents}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {filteredEvents.map((event: any) => {
              const count = event.registrations?.length || 0
              const isFull = count >= event.max_attendees
              const isRegistered = myEventIds.has(event.id)
              const spotsLeft = event.max_attendees - count
              const photoCount = event.event_photos?.[0]?.count || 0

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
                      <span className={`badge ${(CATEGORY_COLORS as any)[event.category]}`}>
                        {(categoryLabels as any)[event.category]}
                      </span>
                      {isRegistered && <span className="badge bg-green-500 text-white">✓</span>}
                      {isFull && !isRegistered && (
                        <span className="badge bg-red-100 text-red-700">{t.full}</span>
                      )}
                      {!isFull && spotsLeft <= 5 && !isRegistered && (
                        <span className="badge bg-orange-100 text-orange-700">{spotsLeft} {t.spots}</span>
                      )}
                      {photoCount > 0 && (
                        <span className="badge bg-white/80 text-gray-700">📸 {photoCount}</span>
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
                        {format(new Date(`${event.date}T${event.time}`), "EEEE d MMMM 'à' HH'h'mm", { locale: dateLocale })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} />
                        {count} / {event.max_attendees}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}