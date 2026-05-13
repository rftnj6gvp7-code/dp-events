'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const TRANSLATIONS: Record<string, any> = {
  fr: { title: 'Mon profil', subtitle: 'Gérer vos informations personnelles', nameTitle: 'Modifier le nom', fullName: 'Nom complet', save: 'Enregistrer', saving: 'Mise à jour…', pwTitle: 'Changer le mot de passe', newPw: 'Nouveau mot de passe', confirm: 'Confirmer', minChars: '6 caractères minimum', changePw: 'Changer le mot de passe', errorName: 'Erreur lors de la mise à jour.', successName: 'Nom mis à jour !', errorPw: 'Erreur lors de la mise à jour.', successPw: 'Mot de passe mis à jour !', mismatch: 'Les mots de passe ne correspondent pas.', tooShort: 'Minimum 6 caractères.', appearance: 'Apparence', light: 'Clair', dark: 'Sombre' },
  en: { title: 'My Profile', subtitle: 'Manage your personal information', nameTitle: 'Edit name', fullName: 'Full name', save: 'Save', saving: 'Updating…', pwTitle: 'Change password', newPw: 'New password', confirm: 'Confirm', minChars: 'Minimum 6 characters', changePw: 'Change password', errorName: 'Error updating.', successName: 'Name updated!', errorPw: 'Error updating.', successPw: 'Password updated!', mismatch: 'Passwords do not match.', tooShort: 'Minimum 6 characters.', appearance: 'Appearance', light: 'Light', dark: 'Dark' },
  de: { title: 'Mein Profil', subtitle: 'Persönliche Informationen verwalten', nameTitle: 'Name ändern', fullName: 'Vollständiger Name', save: 'Speichern', saving: 'Aktualisieren…', pwTitle: 'Passwort ändern', newPw: 'Neues Passwort', confirm: 'Bestätigen', minChars: 'Mindestens 6 Zeichen', changePw: 'Passwort ändern', errorName: 'Fehler.', successName: 'Name aktualisiert!', errorPw: 'Fehler.', successPw: 'Passwort aktualisiert!', mismatch: 'Passwörter stimmen nicht überein.', tooShort: 'Mindestens 6 Zeichen.', appearance: 'Erscheinungsbild', light: 'Hell', dark: 'Dunkel' },
  lu: { title: 'Mäi Profil', subtitle: 'Perséinlech Informatiounen verwalten', nameTitle: 'Numm änneren', fullName: 'Vollstännegen Numm', save: 'Späicheren', saving: 'Aktualiséieren…', pwTitle: 'Passwuert änneren', newPw: 'Neit Passwuert', confirm: 'Bestätegen', minChars: 'Mindestens 6 Zeechen', changePw: 'Passwuert änneren', errorName: 'Feeler.', successName: 'Numm aktualiséiert!', errorPw: 'Feeler.', successPw: 'Passwuert aktualiséiert!', mismatch: 'Passwierder stëmmen net iwwereen.', tooShort: 'Mindestens 6 Zeechen.', appearance: 'Appearance', light: 'Clair', dark: 'Sombre' },
}

export default function ProfileForm({ locale, currentName, currentTheme }: { locale: string; currentName: string; currentTheme: string }) {
  const [fullName, setFullName] = useState(currentName)
  const [theme, setTheme] = useState(currentTheme)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loadingName, setLoadingName] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setLoadingName(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id)
    if (error) toast.error(t.errorName)
    else { toast.success(t.successName); router.refresh() }
    setLoadingName(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error(t.mismatch); return }
    if (password.length < 6) { toast.error(t.tooShort); return }
    setLoadingPw(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) toast.error(t.errorPw)
    else toast.success(t.successPw)
    setPassword('')
    setConfirm('')
    setLoadingPw(false)
  }

 async function handleThemeChange(newTheme: string) {
  setTheme(newTheme)
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('profiles').update({ theme: newTheme }).eq('id', user!.id)
  localStorage.setItem('dp-theme', newTheme)
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(newTheme)
}

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t.nameTitle}</h2>
        <form onSubmit={handleUpdateName} className="space-y-3">
          <div>
            <label className="label">{t.fullName}</label>
            <input className="input" value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Prénom Nom" required />
          </div>
          <button type="submit" disabled={loadingName} className="btn-primary">
            {loadingName ? t.saving : t.save}
          </button>
        </form>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t.pwTitle}</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="label">{t.newPw}</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.minChars} required />
          </div>
          <div>
            <label className="label">{t.confirm}</label>
            <input className="input" type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loadingPw} className="btn-primary">
            {loadingPw ? t.saving : t.changePw}
          </button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">🎨 {t.appearance}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${theme === 'light' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600'}`}>
            ☀️ {t.light}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600'}`}>
            🌙 {t.dark}
          </button>
        </div>
      </div>
    </div>
  )
}