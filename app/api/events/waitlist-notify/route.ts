import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  const adminClient = createAdminClient()

  // Trouver le premier sur la liste d'attente
  const { data: waitlist } = await adminClient
    .from('waitlist')
    .select('*, profile:profiles(email, full_name)')
    .eq('event_id', eventId)
    .order('position', { ascending: true })
    .limit(1)

  if (!waitlist || waitlist.length === 0) return NextResponse.json({ ok: true })

  const first = waitlist[0]
  const profile = first.profile as any

  // Créer une notification in-app
  await adminClient.from('notifications').insert({
    user_id: first.user_id,
    title: '🎉 Une place s\'est libérée !',
    body: 'Une place vient de se libérer pour un événement sur votre liste d\'attente. Inscrivez-vous vite !',
    type: 'info',
    event_id: eventId,
  })

  return NextResponse.json({ ok: true })
}
