'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Calendar, Bell, Users, LogOut, LayoutGrid, BarChart2, UserCircle, History, MoreHorizontal, X } from 'lucide-react'
import clsx from 'clsx'
import LanguageSwitcher from './LanguageSwitcher'
import { useState } from 'react'

interface Props { profile: Profile; unreadCount: number; locale: string }

const NAV_LABELS: Record<string, Record<string, string>> = {
  fr: { events: 'Événements', past: 'Passés', notif: 'Notifications', stats: 'Statistiques', profile: 'Mon profil', manage: 'Gérer les events', users: 'Utilisateurs', logout: 'Déconnexion', more: 'Plus' },
  en: { events: 'Events', past: 'Past', notif: 'Notifications', stats: 'Statistics', profile: 'Profile', manage: 'Manage Events', users: 'Users', logout: 'Logout', more: 'More' },
  de: { events: 'Veranstaltungen', past: 'Vergangen', notif: 'Benachrichtigungen', stats: 'Statistiken', profile: 'Profil', manage: 'Events verwalten', users: 'Benutzer', logout: 'Abmelden', more: 'Mehr' },
  lu: { events: 'Evenementer', past: 'Vergaangen', notif: 'Notifikatiounen', stats: 'Statistiken', profile: 'Profil', manage: 'Evenementer verwalten', users: 'Benotzer', logout: 'Ofmellen', more: 'Méi' },
}

export default function Sidebar({ profile, unreadCount, locale }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isAdmin = profile.role === 'admin'
  const t = NAV_LABELS[locale] || NAV_LABELS.fr
  const [moreOpen, setMoreOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const mainNavItems = [
    { href: '/dashboard', label: t.events, icon: Calendar, exact: true },
    { href: '/dashboard/past-events', label: t.past, icon: History },
    { href: '/dashboard/notifications', label: t.notif, icon: Bell, badge: unreadCount },
    { href: '/dashboard/profile', label: t.profile, icon: UserCircle },
  ]

  const allNavItems = [
    ...mainNavItems,
    { href: '/dashboard/admin/stats', label: t.stats, icon: BarChart2 },
    ...(isAdmin ? [
      { href: '/dashboard/admin/events', label: t.manage, icon: LayoutGrid },
      { href: '/dashboard/admin/users', label: t.users, icon: Users },
    ] : []),
  ]

  const moreItems = [
    { href: '/dashboard/admin/stats', label: t.stats, icon: BarChart2 },
    ...(isAdmin ? [
      { href: '/dashboard/admin/events', label: t.manage, icon: LayoutGrid },
      { href: '/dashboard/admin/users', label: t.users, icon: Users },
    ] : []),
  ]

  const initials = profile.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
            <span className="font-semibold text-base tracking-tight dark:text-white">DP-Diff Events</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {allNavItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-200 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}>
                <item.icon size={16} className={active ? 'text-brand-600' : 'text-gray-400'} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <LanguageSwitcher currentLocale={locale} />
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-white">{profile.full_name}</p>
              <p className="text-xs text-gray-400">{isAdmin ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={15} />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <span className="font-semibold text-base tracking-tight dark:text-white">DP-Diff Events</span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
          )}
          <LanguageSwitcher currentLocale={locale} compact />
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        </div>
      </div>

      {/* MORE MENU MOBILE */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
          <div className="absolute bottom-20 left-0 right-0 mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-2"
            onClick={e => e.stopPropagation()}>
            {moreItems.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors',
                    active ? 'bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}>
                  <item.icon size={18} className={active ? 'text-brand-600' : 'text-gray-400'} />
                  {item.label}
                </Link>
              )
            })}
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut size={18} />
              {t.logout}
            </button>
          </div>
        </div>
      )}

      {/* NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex">
        {mainNavItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors relative',
                active ? 'text-brand-600 font-medium' : 'text-gray-400 dark:text-gray-500'
              )}>
              <item.icon size={20} />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              {item.badge ? (
                <span className="absolute top-2 right-1/4 bg-brand-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={clsx(
            'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
            moreOpen ? 'text-brand-600' : 'text-gray-400 dark:text-gray-500'
          )}>
          {moreOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
          <span className="text-[10px]">{t.more}</span>
        </button>
      </nav>
    </>
  )
}