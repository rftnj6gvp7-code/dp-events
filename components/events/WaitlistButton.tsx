'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const TRANSLATIONS: Record<string, any> = {
  fr: { join: "Liste d'attente", leave: 'Quitter la liste', position: 'position', added: "Ajouté à la liste d'attente !", removed: "Retiré de la liste d'attente.", error: 'Erreur.' },
  en: { join: 'Waitlist', leave: 'Leave waitlist', position: 'position', added: 'Added to waitlist!', removed: 'Removed from waitlist.', error: 'Error.' },
  de: { join: 'Warteliste', leave: 'Warteliste verlassen', position: 'Position', added: 'Zur Warteliste hinzugefügt!', removed: 'Von der Warteliste entfernt.', error: 'Fehler.' },
  lu: { join: 'Waardelist', leave: 'Waardelist verloossen', position: 'Positioun', added: 'Op d\'Waardelist dobäigesat!', removed: 'Vun der Waardelist ewechgeholl.', error: 'Feeler.' },
}

interface Props {
  eventId: string
  userId: string
  isOnWaitlist: boolean
  waitlistPosition: number
  waitlistCount: number
}

export default function WaitlistButton({ eventId, userId, isOnWaitlist, waitlistPosition, waitlistCount }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const locale = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1] || 'fr'
    : 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function handleJoin() {
    setLoading(true)
    const { error } = await supabase.from('waitlist').insert({ event_id: eventId, user_id: userId, position: waitlistCount + 1 })
    if (error) toast.error(t.error)
    else { toast.success(t.added); router.refresh() }
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    const { error } = await supabase.from('waitlist').delete().eq('event_id', eventId).eq('user_id', userId)
    if (error) toast.error(t.error)
    else { toast.success(t.removed); router.refresh() }
    setLoading(false)
  }

  if (isOnWaitlist) return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">
        ⏳ {t.join} — {t.position} <strong>{waitlistPosition}</strong>
      </span>
      <button onClick={handleLeave} disabled={loading} className="btn-danger text-sm">
        {loading ? '…' : t.leave}
      </button>
    </div>
  )

  return (
    <button onClick={handleJoin} disabled={loading} className="btn-secondary flex items-center gap-2">
      {loading ? '…' : `⏳ ${t.join} (${waitlistCount})`}
    </button>
  )
}