import { NextRequest, NextResponse } from 'next/server'
import { sendAccountPendingEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  try {
    await sendAccountPendingEmail(email, name)
  } catch (e) {
    // Don't fail if email sending fails
  }
  return NextResponse.json({ ok: true })
}
