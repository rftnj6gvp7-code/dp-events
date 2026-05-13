import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNewEventEmail, sendEventModifiedEmail, sendEventCancelledEmail } from '@/lib/emails'

const TYPE_TITLES: Record<string, (title: string) => string> = {
  new_event: (t) => `Nouvel événement : ${t}`,
  event_modified: (t) => `Événement modifié : ${t}`,
  event_cancelled: (t) => `Événement annulé : ${t}`,
}

const TYPE_BODIES: Record<string, string> = {
  new_event: 'Un nouvel événement vient d\'être créé. Inscrivez-vous !',
  event_modified: 'Les détails de cet événement ont été mis à jour.',
  event_cancelled: 'Cet événement a été annulé.',
}

export async function POST(req: NextRequest) {
  const adminClient = createAdminClient()
  const { eventId, type } = await req.json()
  const { data: event } = await adminClient.from('events').select('*').eq('id', eventId).single()
  if (!event) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })

  let usersQuery = adminClient.from('profiles').select('id, email, full_name').eq('status', 'active')
  if (type === 'event_modified' || type === 'event_cancelled') {
    const { data: regs } = await adminClient.from('registrations').select('user_id').eq('event_id', eventId)
    const ids = (regs || []).map((r: any) => r.user_id)
    if (ids.length === 0) return NextResponse.json({ ok: true, notified: 0 })
    usersQuery = usersQuery.in('id', ids)
  }

  const { data: users } = await usersQuery
  if (!users || users.length === 0) return NextResponse.json({ ok: true, notified: 0 })

  const notifications = users.map((u: any) => ({
    user_id: u.id,
    title: TYPE_TITLES[type]?.(event.title) || event.title,
    body: TYPE_BODIES[type] || '',
    type,
    event_id: eventId,
  }))
  await adminClient.from('notifications').insert(notifications)

  const userIds = users.map((u: any) => u.id)
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: TYPE_TITLES[type]?.(event.title) || event.title,
      body: TYPE_BODIES[type] || '',
      url: `/dashboard/events/${eventId}`,
      userIds,
    })
  }).catch(() => {})

  const emailData = { title: event.title, date: event.date, time: event.time, location: event.location, id: event.id }
  users.forEach((u: any) => {
    try {
      if (type === 'new_event') sendNewEventEmail(u.email, u.full_name, emailData).catch(() => {})
      else if (type === 'event_modified') sendEventModifiedEmail(u.email, u.full_name, emailData).catch(() => {})
      else if (type === 'event_cancelled') sendEventCancelledEmail(u.email, u.full_name, event.title).catch(() => {})
    } catch {}
  })

  return NextResponse.json({ ok: true, notified: users.length })
}