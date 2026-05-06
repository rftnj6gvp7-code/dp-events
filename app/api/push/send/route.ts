import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import webpush from 'web-push'

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const { title, body, url, userIds } = await req.json()
  const adminClient = createAdminClient()

  let query = adminClient.from('push_subscriptions').select('subscription')
  if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds)
  }

  const { data: subs } = await query
  if (!subs || subs.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({ title, body, url })

  await Promise.allSettled(
    subs.map((s: any) => webpush.sendNotification(s.subscription as any, payload))
  )

  return NextResponse.json({ ok: true, sent: subs.length })
}