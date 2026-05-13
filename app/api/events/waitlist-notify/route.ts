import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWaitlistAvailableEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  const adminClient = createAdminClient()

  // Vérifier combien de places sont disponibles
  const { data: event } = await adminClient
    .from('events')
    .select('*, registrations(count)')
    .eq('id', eventId)
    .single()

  if (!event) return NextResponse.json({ ok: true })

  const registrationCount = (event.registrations as any)?.[0]?.count || 0
  const availablePlaces = event.max_attendees - registrationCount

  if (availablePlaces <= 0) return NextResponse.json({ ok: true, notified: 0 })

  // Prendre TOUTE la liste d'attente
  const { data: waitlist } = await adminClient
    .from('waitlist')
    .select('*, profile:profiles(id, email, full_name)')
    .eq('event_id', eventId)
    .order('position', { ascending: true })

  if (!waitlist || waitlist.length === 0) return NextResponse.json({ ok: true, notified: 0 })

  const emailData = {
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    id: event.id,
  }

  for (const w of waitlist) {
    const profile = w.profile as any
    if (!profile) continue

    await adminClient.from('notifications').insert({
      user_id: w.user_id,
      title: `Place disponible : ${event.title}`,
      body: 'Une place vient de se libérer. Inscrivez-vous vite !',
      type: 'info',
      event_id: eventId,
    })

    try {
      await sendWaitlistAvailableEmail(profile.email, profile.full_name, emailData)
    } catch {}
  }

  return NextResponse.json({ ok: true, notified: waitlist.length })
}