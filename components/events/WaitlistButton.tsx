'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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

  async function handleJoin() {
    setLoading(true)
    const { error } = await supabase
      .from('waitlist')
      .insert({ event_id: eventId, user_id: userId, position: waitlistCount + 1 })
    if (error) toast.error('Erreur lors de l\'inscription en liste d\'attente.')
    else { toast.success('Ajouté à la liste d\'attente !'); router.refresh() }
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
    if (error) toast.error('Erreur lors de la désinscription.')
    else { toast.success('Retiré de la liste d\'attente.'); router.refresh() }
    setLoading(false)
  }

  if (isOnWaitlist) return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">
        ⏳ Liste d'attente — position <strong>{waitlistPosition}</strong>
      </span>
      <button onClick={handleLeave} disabled={loading} className="btn-danger text-sm">
        {loading ? '…' : 'Quitter la liste'}
      </button>
    </div>
  )

  return (
    <button onClick={handleJoin} disabled={loading}
      className="btn-secondary flex items-center gap-2">
      {loading ? '…' : `⏳ Liste d'attente (${waitlistCount})`}
    </button>
  )
}