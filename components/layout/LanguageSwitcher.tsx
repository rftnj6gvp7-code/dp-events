'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'lu', flag: '🇱🇺' },
]

export default function LanguageSwitcher({ currentLocale, compact = false }: { currentLocale: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function changeLanguage(locale: string) {
    setLoading(true)
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    })
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  const current = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0]

  if (compact) {
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)}
          className="text-sm px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
          {current.flag}
        </button>
        {open && (
          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 p-1 z-50 flex gap-1">
            {LANGUAGES.map(lang => (
              <button key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                disabled={loading || currentLocale === lang.code}
                className={`text-sm px-2 py-1 rounded-md transition-colors ${currentLocale === lang.code ? 'bg-brand-600 text-white' : 'hover:bg-gray-100'}`}>
                {lang.flag}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {LANGUAGES.map(lang => (
        <button key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          disabled={loading || currentLocale === lang.code}
          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
            currentLocale === lang.code
              ? 'bg-brand-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}>
          {lang.flag} {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}