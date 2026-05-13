import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import ProfileForm from '@/components/profile/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const cookieStore = cookies()
  const locale = cookieStore.get('locale')?.value || 'fr'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, theme')
    .eq('id', user!.id)
    .single()

  return <ProfileForm locale={locale} currentName={profile?.full_name || ''} currentTheme={profile?.theme || 'light'} />
}