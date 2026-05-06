'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'lu', label: 'LU', flag: '🇱🇺' },
]

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function changeLanguage(locale: string) {
    setLoading(true)
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    })
    router.refresh()
    setLoading(false)
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
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  )
}