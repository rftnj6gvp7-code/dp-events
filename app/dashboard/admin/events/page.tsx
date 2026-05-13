import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import { CATEGORY_LABELS_I18N } from '@/types'
import EventFormModal from '@/components/admin/EventFormModal'
import DeleteEventButton from '@/components/admin/DeleteEventButton'
import ExportEventsButton from '@/components/admin/ExportEventsButton'
import ImportEventsButton from '@/components/admin/ImportEventsButton'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATE_LOCALES: Record<string, any> = { fr, en: enUS, de, lu: fr }

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Gestion des événements', events: 'événement(s)', newEvent: 'Nouvel événement', export: 'Exporter', import: 'Importer CSV/Excel', noEvents: 'Aucun événement créé.', cancelled: 'Annulé', edit: 'Modifier', delete: 'Suppr.' },
  en: { title: 'Event Management', events: 'event(s)', newEvent: 'New Event', export: 'Export', import: 'Import CSV/Excel', noEvents: 'No events created.', cancelled: 'Cancelled', edit: 'Edit', delete: 'Delete' },
  de: { title: 'Veranstaltungsverwaltung', events: 'Veranstaltung(en)', newEvent: 'Neue Veranstaltung', export: 'Exportieren', import: 'CSV/Excel importieren', noEvents: 'Keine Veranstaltungen erstellt.', cancelled: 'Abgesagt', edit: 'Bearbeiten', delete: 'Löschen' },
  lu: { title: 'Evenementer verwalten', events: 'Evenement(er)', newEvent: 'Neit Evenement', export: 'Exportéieren', import: 'CSV/Excel importéieren', noEvents: 'Keng Evenementer erstallt.', cancelled: 'Ofgesot', edit: 'Änneren', delete: 'Läschen' },
}

export default async function AdminEventsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr
  const dateLocale = DATE_LOCALES[locale] || fr
  const categoryLabels = CATEGORY_LABELS_I18N[locale] || CATEGORY_LABELS_I18N.fr

  const { data: events } = await supabase
    .from('events')
    .select('*, registration_count:registrations(count)')
    .order('date', { ascending: true })

  return (
    <div className="p-4 md:p-6 dark:bg-gray-950 min-h-screen">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold dark:text-white">{t.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{events?.length || 0} {t.events}</p>
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
                    <Link href={`/dashboard/events/${event.id}`} className="font-medium text-sm dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors block truncate">
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {format(new Date(`${event.date}T${event.time}`), "d MMM yyyy 'à' HH'h'mm", { locale: dateLocale })} · {event.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{(categoryLabels as any)[event.category]}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{count}/{event.max_attendees}</span>
                      {event.is_cancelled && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">{t.cancelled}</span>}
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
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">{t.noEvents}</div>
        )}
      </div>
    </div>
  )
}