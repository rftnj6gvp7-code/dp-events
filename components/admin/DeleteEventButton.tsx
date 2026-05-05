'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteEventButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    // Notify registrants first
    await fetch('/api/events/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, type: 'event_cancelled' })
    })
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) toast.error('Erreur lors de la suppression.')
    else { toast.success('Événement supprimé.'); router.refresh() }
    setLoading(false)
    setConfirm(false)
  }

  if (confirm) return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">Confirmer ?</span>
      <button onClick={handleDelete} disabled={loading} className="btn-danger text-xs py-1 px-2">
        {loading ? '…' : 'Oui'}
      </button>
      <button onClick={() => setConfirm(false)} className="btn-secondary text-xs py-1 px-2">Non</button>
    </div>
  )

  return (
    <button onClick={() => setConfirm(true)}
      className="btn-danger text-xs py-1 px-2 flex items-center gap-1">
      <Trash2 size={12} /> Suppr.
    </button>
  )
}
