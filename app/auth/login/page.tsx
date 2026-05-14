'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Connectez-vous à votre compte', email: 'Email', password: 'Mot de passe', connect: 'Se connecter', connecting: 'Connexion…', forgot: 'Mot de passe oublié ?', noAccount: 'Pas encore de compte ?', request: 'Faire une demande', error: 'Email ou mot de passe incorrect.', resetTitle: 'Réinitialiser le mot de passe', sendReset: 'Envoyer le lien', sending: 'Envoi…', resetSent: 'Email de réinitialisation envoyé !', resetError: "Erreur lors de l'envoi.", back: '← Retour à la connexion' },
  en: { title: 'Sign in to your account', email: 'Email', password: 'Password', connect: 'Sign in', connecting: 'Signing in…', forgot: 'Forgot password?', noAccount: 'No account yet?', request: 'Request access', error: 'Incorrect email or password.', resetTitle: 'Reset password', sendReset: 'Send reset link', sending: 'Sending…', resetSent: 'Reset email sent!', resetError: 'Error sending email.', back: '← Back to login' },
  de: { title: 'Bei Ihrem Konto anmelden', email: 'E-Mail', password: 'Passwort', connect: 'Einloggen', connecting: 'Anmelden…', forgot: 'Passwort vergessen?', noAccount: 'Noch kein Konto?', request: 'Zugang beantragen', error: 'Falsche E-Mail oder falsches Passwort.', resetTitle: 'Passwort zurücksetzen', sendReset: 'Reset-Link senden', sending: 'Senden…', resetSent: 'Reset-E-Mail gesendet!', resetError: 'Fehler beim Senden.', back: '← Zurück zur Anmeldung' },
  lu: { title: 'Loggt iech an äre Kont an', email: 'E-Mail', password: 'Passwuert', connect: 'Aloggen', connecting: 'Umellen…', forgot: 'Passwuert vergiess?', noAccount: 'Nach kee Kont?', request: 'Zougank ufroen', error: 'Falsch E-Mail oder Passwuert.', resetTitle: 'Passwuert zrécksetzen', sendReset: 'Reset-Link schécken', sending: 'Schécken…', resetSent: 'Reset-E-Mail geschéckt!', resetError: 'Feeler beim Schécken.', back: '← Zréck zur Umeldung' },
}

const LANGS = [
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'de', label: '🇩🇪 DE' },
  { code: 'lu', label: '🇱🇺 LU' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'fr'
    const saved = document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1]
    if (saved && ['fr','en','de','lu'].includes(saved)) return saved
    const browser = navigator.language.slice(0, 2)
    return ['fr','en','de','lu'].includes(browser) ? browser : 'fr'
  })
  const router = useRouter()
  const supabase = createClient()
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function changeLanguage(code: string) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code })
    })
    setLocale(code)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) toast.error(t.error)
    else { router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://dp-events.vercel.app/auth/reset-password',
    })
    if (error) toast.error(t.resetError)
    else { toast.success(t.resetSent); setForgotMode(false) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4 light" style={{colorScheme: 'light'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-brand-600" />
            <span className="text-xl font-semibold tracking-tight">DP-Differdange Events</span>
          </div>
          <p className="text-sm text-gray-500">
            {forgotMode ? t.resetTitle : t.title}
          </p>
        </div>

        <div className="card p-6">
          {forgotMode ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="label">{t.email}</label>
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@dp.lu" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
                {loading ? t.sending : t.sendReset}
              </button>
              <button type="button" onClick={() => setForgotMode(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                {t.back}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">{t.email}</label>
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@dp.lu" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">{t.password}</label>
                  <button type="button" onClick={() => setForgotMode(true)}
                    className="text-xs text-brand-600 hover:underline">
                    {t.forgot}
                  </button>
                </div>
                <input className="input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
                {loading ? t.connecting : t.connect}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            {t.noAccount}{' '}
            <Link href="/auth/register" className="text-brand-600 hover:underline font-medium">
              {t.request}
            </Link>
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {LANGS.map(lang => (
            <button key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${locale === lang.code ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}