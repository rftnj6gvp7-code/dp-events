import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { subscription, userId } = await req.json()
  const adminClient = createAdminClient()

  await adminClient
    .from('push_subscriptions')
    .upsert({ user_id: userId, subscription }, { onConflict: 'user_id' })

  return NextResponse.json({ ok: true })
}
