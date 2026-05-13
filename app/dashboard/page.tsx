import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS_I18N } from '@/types'
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
  fr: { title: 'Événements à venir', noEvents: 'Aucun événement trouvé.', list: 'Liste', calendar: 'Calendrier', spots: 'places', full: 'Complet' },
  en: { title: 'Upcoming Events', noEvents: 'No events found.', list: 'List', calendar: 'Calendar', spots: 'spots', full: 'Full' },
  de: { title: 'Bevorstehende Veranstaltungen', noEvents: 'Keine Veranstaltungen gefunden.', list: 'Liste', calendar: 'Kalender', spots: 'Plätze', full: 'Ausgebucht' },
  lu: { title: 'Komend Evenementer', noEvents: 'Keng Evenementer fonnt.', list: 'Lëscht', calendar: 'Kalenner', spots: 'Plazen', full: 'Ausgebucht' },
}

const CATEGORY_BG: Record<string, string> = {
  conference: 'bg-[#0D2545]',
  sport: 'bg-[#0D2518]',
  workshop: 'bg-[#1A0D35]',
  social: 'bg-[#1A1530]',
  other: 'bg-[#1A1A2E]',
}

const CATEGORY_ACCENT: Record<string, string> = {
  conference: 'bg-[#4D9FFF]',
  sport: 'bg-[#4DFF96]',
  workshop: 'bg-[#B44DFF]',
  social: 'bg-[#FF9F4D]',
  other: 'bg-[#4DFFFF]',
}

const CATEGORY_TAG: Record<string, string> = {
  conference: 'bg-blue-900/30 text-blue-400 border border-blue-500/20',
  sport: 'bg-green-900/30 text-green-400 border border-green-500/20',
  workshop: 'bg-purple-900/30 text-purple-400 border border-purple-500/20',
  social: 'bg-orange-900/30 text-orange-400 border border-orange-500/20',
  other: 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/20',
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
    <div className="p-4 md:p-6 dark:bg-gray-950 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredEvents.length} événement(s)</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
          <Link href="?view=list"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!isCalendarView ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            ☰ {t.list}
          </Link>
          <Link href="?view=calendar"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isCalendarView ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
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
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
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
              const cat = event.category || 'other'

              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}
                  className="card overflow-hidden group hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
                  <div className={`relative h-36 overflow-hidden ${event.cover_url ? 'bg-gray-900' : CATEGORY_BG[cat] || CATEGORY_BG.other}`}>
                    {event.cover_url ? (
                      <Image src={event.cover_url} alt={event.title} fill className="object-cover" />
                    ) : (
                      <>
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${CATEGORY_ACCENT[cat] || CATEGORY_ACCENT.other}`} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                          <div className="w-20 h-20 rounded-full border-2 border-white" />
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                      <span className={`badge ${CATEGORY_TAG[cat] || CATEGORY_TAG.other}`}>
                        {(categoryLabels as any)[cat]}
                      </span>
                      {isRegistered && (
                        <span className="badge bg-green-900/30 text-green-400 border border-green-500/20">✓ Inscrit</span>
                      )}
                      {isFull && !isRegistered && (
                        <span className="badge bg-red-900/30 text-red-400 border border-red-500/20">{t.full}</span>
                      )}
                      {!isFull && spotsLeft <= 5 && !isRegistered && (
                        <span className="badge bg-orange-900/30 text-orange-400 border border-orange-500/20">{spotsLeft} {t.spots}</span>
                      )}
                      {photoCount > 0 && (
                        <span className="badge bg-white/10 text-white/70">📸 {photoCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                      {event.title}
                    </h2>
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
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