'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const LABELS: Record<string, string> = {
  fr: 'Tout marquer lu',
  en: 'Mark all as read',
  de: 'Alle als gelesen markieren',
  lu: 'All als gelies markéieren',
}

export default function MarkAllReadButton({ userId, locale = 'fr' }: { userId: string; locale?: string }) {
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
      {LABELS[locale] || LABELS.fr}
    </button>
  )
}