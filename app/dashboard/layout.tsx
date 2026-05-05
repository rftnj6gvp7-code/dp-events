import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  if (!user) redirect('/auth/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user?.id ?? '')
  .single()

if (!profile) redirect('/auth/login')
    .single()

  if (!profile || profile.status !== 'active') {
    await supabase.auth.signOut()
    redirect('/auth/login?error=not_active')
  }

  // Unread notifications count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar profile={profile} unreadCount={unreadCount || 0} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
