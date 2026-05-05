'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MarkAllReadButton({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function markAll() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    router.refresh()
  }

  return (
    <button onClick={markAll} className="btn-secondary text-sm">
      Tout marquer lu
    </button>
  )
}
