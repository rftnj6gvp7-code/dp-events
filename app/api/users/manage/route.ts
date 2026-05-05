import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendAccountValidatedEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { userId, action, email, name } = await req.json()
  const adminClient = createAdminClient()

  switch (action) {
    case 'approve': {
      await adminClient.from('profiles').update({ status: 'active' }).eq('id', userId)
      // Send validation email
      try { await sendAccountValidatedEmail(email, name) } catch {}
      // Create welcome notification
      await adminClient.from('notifications').insert({
        user_id: userId,
        title: 'Bienvenue sur DP Events !',
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
    case 'delete': {
      // Delete auth user (cascade deletes profile)
      await adminClient.auth.admin.deleteUser(userId)
      break
    }
    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
