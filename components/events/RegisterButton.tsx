'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  eventId: string
  userId: string
  isRegistered: boolean
  isFull: boolean
}

export default function RegisterButton({ eventId, userId, isRegistered, isFull }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister() {
    setLoading(true)
    const { error } = await supabase
      .from('registrations')
      .insert({ event_id: eventId, user_id: userId })
    if (error) toast.error('Erreur lors de l\'inscription.')
    else { toast.success('Inscription confirmée !'); router.refresh() }
    setLoading(false)
  }

  async function handleUnregister() {
    setLoading(true)
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) {
      toast.error('Erreur lors de la désinscription.')
      setLoading(false)
      return
    }

    // Notifier le premier sur la liste d'attente
    await fetch('/api/events/waitlist-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId })
    })

    toast.success('Désinscription confirmée.')
    router.refresh()
    setLoading(false)
  }

  if (isRegistered) return (
    <button onClick={handleUnregister} disabled={loading}
      className="btn-danger shrink-0 text-sm">
      {loading ? '…' : 'Se désinscrire'}
    </button>
  )

  if (isFull) return (
    <span className="shrink-0 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-200">
      Complet
    </span>
  )

  return (
    <button onClick={handleRegister} disabled={loading}
      className="btn-primary shrink-0">
      {loading ? '…' : "S'inscrire"}
    </button>
  )
}