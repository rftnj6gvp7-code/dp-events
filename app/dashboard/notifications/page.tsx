import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { fr, enUS, de } from 'date-fns/locale'
import Link from 'next/link'
import MarkAllReadButton from '@/components/notifications/MarkAllReadButton'
import { cookies } from 'next/headers'

const TYPE_ICONS: Record<string, string> = {
  new_event: '🎉',
  event_modified: '✏️',
  event_cancelled: '❌',
  account_validated: '✅',
  info: 'ℹ️',
}

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Notifications', unread: 'non lues', markAll: 'Tout marquer lu', none: 'Aucune notification.', seeEvent: "Voir l'événement →" },
  en: { title: 'Notifications', unread: 'unread', markAll: 'Mark all as read', none: 'No notifications.', seeEvent: 'See event →' },
  de: { title: 'Benachrichtigungen', unread: 'ungelesen', markAll: 'Alle als gelesen markieren', none: 'Keine Benachrichtigungen.', seeEvent: 'Veranstaltung ansehen →' },
  lu: { title: 'Notifikatiounen', unread: 'ongelies', markAll: 'All als gelies markéieren', none: 'Keng Notifikatiounen.', seeEvent: 'Evenement gesinn →' },
}

const DATE_LOCALES: Record<string, any> = { fr, en: enUS, de, lu: fr }

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr
  const dateLocale = DATE_LOCALES[locale] || fr

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, event:events(id, title)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {notifications?.filter(n => !n.is_read).length || 0} {t.unread}
          </p>
        </div>
<MarkAllReadButton userId={user!.id} locale={locale} />
      </div>

      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">🔔</div>
          <p>{t.none}</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map(notif => (
          <div key={notif.id}
            className={`card p-4 flex gap-3 ${!notif.is_read ? 'border-brand-200 bg-brand-50/30' : ''}`}>
            <span className="text-xl mt-0.5">{TYPE_ICONS[notif.type] || 'ℹ️'}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!notif.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {notif.title}
              </p>
              {notif.body && <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-400">
                  {format(new Date(notif.created_at), "d MMM 'à' HH'h'mm", { locale: dateLocale })}
                </span>
                {notif.event && (
                  <Link href={`/dashboard/events/${notif.event.id}`}
                    className="text-xs text-brand-600 hover:underline">
                    {t.seeEvent}
                  </Link>
                )}
              </div>
            </div>
            {!notif.is_read && (
              <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}