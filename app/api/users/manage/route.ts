import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAccountValidatedEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const adminClient = createAdminClient()
  const { userId, action, email, name } = await req.json()

  switch (action) {
    case 'approve': {
      await adminClient.from('profiles').update({ status: 'active' }).eq('id', userId)
      try { await sendAccountValidatedEmail(email, name) } catch {}
      await adminClient.from('notifications').insert({
        user_id: userId,
        title: 'Bienvenue sur DP-Differdange Events !',
        body: 'Votre compte a été validé. Vous pouvez maintenant vous inscrire aux événements.',
        type: 'account_validated'
      })
      break
    }
    case 'reject':
      await adminClient.from('profiles').update({ status: 'rejected' }).eq('id', userId)
      break
    case 'make_admin':
      await adminClient.from('profiles').update({ role: 'admin' }).eq('id', userId)
      break
    case 'make_user':
      await adminClient.from('profiles').update({ role: 'user' }).eq('id', userId)
      break
    case 'delete':
      await adminClient.auth.admin.deleteUser(userId)
      break
    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}