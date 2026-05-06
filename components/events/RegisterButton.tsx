'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const TRANSLATIONS: Record<string, any> = {
  fr: { register: "S'inscrire", unregister: 'Se désinscrire', full: 'Complet', registered: 'Inscription confirmée !', unregistered: 'Désinscription confirmée.', error: "Erreur lors de l'inscription.", errorUnregister: 'Erreur lors de la désinscription.' },
  en: { register: 'Register', unregister: 'Unregister', full: 'Full', registered: 'Registration confirmed!', unregistered: 'Unregistration confirmed.', error: 'Error registering.', errorUnregister: 'Error unregistering.' },
  de: { register: 'Anmelden', unregister: 'Abmelden', full: 'Ausgebucht', registered: 'Anmeldung bestätigt!', unregistered: 'Abmeldung bestätigt.', error: 'Fehler bei der Anmeldung.', errorUnregister: 'Fehler bei der Abmeldung.' },
  lu: { register: 'Umellen', unregister: 'Ofmellen', full: 'Ausgebucht', registered: 'Umeldung bestätegt!', unregistered: 'Ofmeldung bestätegt.', error: 'Feeler beim Umellen.', errorUnregister: 'Feeler beim Ofmellen.' },
}

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

  const locale = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1] || 'fr'
    : 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function handleRegister() {
    setLoading(true)
    const { error } = await supabase.from('registrations').insert({ event_id: eventId, user_id: userId })
    if (error) toast.error(t.error)
    else { toast.success(t.registered); router.refresh() }
    setLoading(false)
  }

  async function handleUnregister() {
    setLoading(true)
    const { error } = await supabase.from('registrations').delete().eq('event_id', eventId).eq('user_id', userId)
    if (error) { toast.error(t.errorUnregister); setLoading(false); return }
    await fetch('/api/events/waitlist-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId })
    })
    toast.success(t.unregistered)
    router.refresh()
    setLoading(false)
  }

  if (isRegistered) return (
    <button onClick={handleUnregister} disabled={loading} className="btn-danger shrink-0 text-sm">
      {loading ? '…' : t.unregister}
    </button>
  )

  if (isFull) return (
    <span className="shrink-0 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-200">{t.full}</span>
  )

  return (
    <button onClick={handleRegister} disabled={loading} className="btn-primary shrink-0">
      {loading ? '…' : t.register}
    </button>
  )
}