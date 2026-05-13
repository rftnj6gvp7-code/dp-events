import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEventReminderEmail } from '@/lib/emails'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: events } = await adminClient
    .from('events')
    .select('*')
    .eq('date', tomorrowStr)
    .eq('is_cancelled', false)

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, reminders: 0 })
  }

  let totalSent = 0

  for (const event of events) {
    const { data: registrations } = await adminClient
      .from('registrations')
      .select('user_id, profile:profiles(email, full_name)')
      .eq('event_id', event.id)

    if (!registrations || registrations.length === 0) continue

    for (const reg of registrations) {
      const profile = reg.profile as any
      if (!profile) continue
      try {
        await sendEventReminderEmail(profile.email, profile.full_name, {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          id: event.id,
        })
        totalSent++
      } catch {}
    }

    const userIds = registrations.map((r: any) => r.user_id)
    await adminClient.from('notifications').insert(
      userIds.map((uid: string) => ({
        user_id: uid,
        title: `Rappel : ${event.title} demain !`,
        body: `L'événement a lieu demain à ${event.time.slice(0,5)} à ${event.location}`,
        type: 'info',
        event_id: event.id,
      }))
    )
  }

  return NextResponse.json({ ok: true, reminders: totalSent })
}
