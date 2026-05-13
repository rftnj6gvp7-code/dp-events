import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS_I18N } from '@/types'
import { format } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Camera } from 'lucide-react'
import ArchiveEventButton from '@/components/admin/ArchiveEventButton'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Événements passés', archives: 'Archives', recent: 'Récents', none: 'Aucun événement passé.', noneArchived: 'Aucun événement archivé.' },
  en: { title: 'Past Events', archives: 'Archives', recent: 'Recent', none: 'No past events.', noneArchived: 'No archived events.' },
  de: { title: 'Vergangene Events', archives: 'Archiv', recent: 'Aktuell', none: 'Keine vergangenen Veranstaltungen.', noneArchived: 'Keine archivierten Veranstaltungen.' },
  lu: { title: 'Vergaangen Evenementer', archives: 'Archiv', recent: 'Rezent', none: 'Keng vergaangen Evenementer.', noneArchived: 'Keng archivéiert Evenementer.' },
}

const DATE_LOCALES: Record<string, any> = { fr, en: enUS, de, lu: fr }

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

export default async function PastEventsPage({
  searchParams
}: {
  searchParams: { archived?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = currentProfile?.role === 'admin'

  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr
  const dateLocale = DATE_LOCALES[locale] || fr
  const categoryLabels = CATEGORY_LABELS_I18N[locale] || CATEGORY_LABELS_I18N.fr

  const showArchived = searchParams.archived === 'true'

  const { data: events } = await supabase
    .from('events')
    .select('*, registrations(user_id), event_photos(count)')
    .lt('date', new Date().toISOString().split('T')[0])
    .eq('is_cancelled', false)
    .eq('is_archived', showArchived)
    .order('date', { ascending: false })

  return (
    <div className="p-4 md:p-6 dark:bg-gray-950 min-h-screen">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold dark:text-white">
            {showArchived ? `🗄️ ${t.archives}` : t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{events?.length || 0} événement(s)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/past-events"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!showArchived ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {t.recent}
          </Link>
          <Link href="/dashboard/past-events?archived=true"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showArchived ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {t.archives}
          </Link>
        </div>
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-5xl mb-3">{showArchived ? '🗄️' : '📅'}</div>
          <p>{showArchived ? t.noneArchived : t.none}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events?.map((event: any) => {
          const photoCount = event.event_photos?.[0]?.count || 0
          const cat = event.category || 'other'
          return (
            <div key={event.id} className="card overflow-hidden group hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
              <Link href={`/dashboard/events/${event.id}`}>
                <div className={`relative h-36 overflow-hidden ${event.cover_url ? 'bg-gray-900' : CATEGORY_BG[cat] || CATEGORY_BG.other}`}>
                  {event.cover_url ? (
                    <Image src={event.cover_url} alt={event.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                  ) : (
                    <>
                      <div className={`absolute top-0 left-0 right-0 h-0.5 ${CATEGORY_ACCENT[cat] || CATEGORY_ACCENT.other}`} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <div className="w-20 h-20 rounded-full border-2 border-white" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    <span className={`badge ${CATEGORY_TAG[cat] || CATEGORY_TAG.other}`}>
                      {(categoryLabels as any)[cat]}
                    </span>
                    {photoCount > 0 && (
                      <span className="badge bg-white/10 text-white/70">
                        <Camera size={10} className="mr-1 inline" />{photoCount}
                      </span>
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
                      {format(new Date(`${event.date}T${event.time}`), "EEEE d MMMM yyyy", { locale: dateLocale })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {event.location}
                    </div>
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <div className="px-4 pb-4">
                  <ArchiveEventButton eventId={event.id} isArchived={event.is_archived || false} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}