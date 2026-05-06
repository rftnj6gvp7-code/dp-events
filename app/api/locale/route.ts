import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { locale } = await req.json()
  const validLocales = ['fr', 'en', 'de', 'lu']
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set('locale', locale, { path: '/', maxAge: 365 * 24 * 60 * 60 })
  return response
}
