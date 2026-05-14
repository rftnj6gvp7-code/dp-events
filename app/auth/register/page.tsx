'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Créer un compte', subtitle: 'Votre demande sera validée par un administrateur', fullName: 'Nom complet', email: 'Email institutionnel', password: 'Mot de passe', confirm: 'Confirmer le mot de passe', submit: 'Envoyer la demande', sending: 'Envoi…', alreadyAccount: 'Déjà un compte ?', login: 'Se connecter', mismatch: 'Les mots de passe ne correspondent pas.', tooShort: 'Le mot de passe doit faire au moins 6 caractères.', namePlaceholder: 'Prénom Nom', pendingTitle: 'Demande envoyée !', pendingText: 'Un administrateur va examiner votre demande. Vous recevrez un email dès que votre compte sera activé.', backToLogin: 'Retour à la connexion' },
  en: { title: 'Create an account', subtitle: 'Your request will be validated by an administrator', fullName: 'Full name', email: 'Institutional email', password: 'Password', confirm: 'Confirm password', submit: 'Send request', sending: 'Sending…', alreadyAccount: 'Already have an account?', login: 'Sign in', mismatch: 'Passwords do not match.', tooShort: 'Password must be at least 6 characters.', namePlaceholder: 'First Last', pendingTitle: 'Request sent!', pendingText: 'An administrator will review your request. You will receive an email once your account is activated.', backToLogin: 'Back to login' },
  de: { title: 'Konto erstellen', subtitle: 'Ihre Anfrage wird von einem Administrator validiert', fullName: 'Vollständiger Name', email: 'Institutionelle E-Mail', password: 'Passwort', confirm: 'Passwort bestätigen', submit: 'Anfrage senden', sending: 'Senden…', alreadyAccount: 'Haben Sie bereits ein Konto?', login: 'Einloggen', mismatch: 'Passwörter stimmen nicht überein.', tooShort: 'Passwort muss mindestens 6 Zeichen lang sein.', namePlaceholder: 'Vorname Nachname', pendingTitle: 'Anfrage gesendet!', pendingText: 'Ein Administrator wird Ihre Anfrage prüfen. Sie erhalten eine E-Mail, sobald Ihr Konto aktiviert ist.', backToLogin: 'Zurück zur Anmeldung' },
  lu: { title: 'Kont erstellen', subtitle: 'Är Ufro gëtt vun engem Administrateur validéiert', fullName: 'Vollstännegen Numm', email: 'Institutionell E-Mail', password: 'Passwuert', confirm: 'Passwuert bestätegen', submit: 'Ufro schécken', sending: 'Schécken…', alreadyAccount: 'Hutt Dir schonn e Kont?', login: 'Aloggen', mismatch: 'Passwierder stëmmen net iwwereen.', tooShort: 'Passwuert muss mindestens 6 Zeechen laang sinn.', namePlaceholder: 'Virnumm Numm', pendingTitle: 'Ufro geschéckt!', pendingText: 'En Administrateur wäert Är Ufro préiwen. Dir kritt eng E-Mail wann äre Kont aktivéiert ass.', backToLogin: 'Zréck zur Umeldung' },
}

const LANGS = [
  { code: 'fr', label: '🇫🇷 FR' },
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'de', label: '🇩🇪 DE' },
  { code: 'lu', label: '🇱🇺 LU' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [locale, setLocale] = useState('fr')
  const supabase = createClient()

  useEffect(() => {
    // Lire le cookie locale comme sur la page login
    const saved = document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1]
    if (saved && ['fr', 'en', 'de', 'lu'].includes(saved)) {
      setLocale(saved)
    }
  }, [])

  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function changeLanguage(code: string) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code })
    })
    setLocale(code)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error(t.mismatch); return }
    if (form.password.length < 6) { toast.error(t.tooShort); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'user' } }
    })

    if (error) {
      toast.error(error.message)
    } else {
      await fetch('/api/auth/notify-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.fullName })
      })
      setDone(true)
    }
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-semibold mb-2">{t.pendingTitle}</h2>
        <p className="text-sm text-gray-500 mb-4">{t.pendingText}</p>
        <Link href="/auth/login" className="btn-secondary inline-block">{t.backToLogin}</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-brand-600" />
            <span className="text-xl font-semibold tracking-tight">DP-Diff Events</span>
          </div>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t.fullName}</label>
              <input className="input" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder={t.namePlaceholder} required />
            </div>
            <div>
              <label className="label">{t.email}</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vous@dp.lu" required />
            </div>
            <div>
              <label className="label">{t.password}</label>
              <input className="input" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="6 caractères minimum" required />
            </div>
            <div>
              <label className="label">{t.confirm}</label>
              <input className="input" type="password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center">
              {loading ? t.sending : t.submit}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {t.alreadyAccount}{' '}
            <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">{t.login}</Link>
          </p>
        </div>

        {/* Sélecteur de langue */}
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