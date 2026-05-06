'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Calendar, Bell, Users, LogOut, LayoutGrid, BarChart2, UserCircle, History } from 'lucide-react'
import clsx from 'clsx'

interface Props { profile: Profile; unreadCount: number }

export default function Sidebar({ profile, unreadCount }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isAdmin = profile.role === 'admin'

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Événements', icon: Calendar, exact: true },
    { href: '/dashboard/past-events', label: 'Événements passés', icon: History },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { href: '/dashboard/admin/stats', label: 'Statistiques', icon: BarChart2 },
    { href: '/dashboard/profile', label: 'Mon profil', icon: UserCircle },
    ...(isAdmin ? [
      { href: '/dashboard/admin/events', label: 'Gérer les events', icon: LayoutGrid },
      { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
    ] : []),
  ]

  const initials = profile.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
            <span className="font-semibold text-base tracking-tight">DP Events</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-400">{profile.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <span className="font-semibold text-base tracking-tight">DP Events</span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
          )}
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors relative',
                active ? 'text-brand-600 font-medium' : 'text-gray-400'
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
        <button onClick={logout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-gray-400">
          <LogOut size={20} />
          <span className="text-[10px]">Quitter</span>
        </button>
      </nav>
    </>
  )
}