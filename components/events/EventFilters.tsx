'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

const TRANSLATIONS: Record<string, any> = {
  fr: { all: 'Tous', search: 'Rechercher un événement...', week: 'Cette semaine', month: 'Ce mois', allDates: 'Toutes les dates', mine: '✓ Mes inscriptions', conference: 'Conférence', sport: 'Sport', workshop: 'Atelier', social: 'Social', other: 'Autre' },
  en: { all: 'All', search: 'Search for an event...', week: 'This week', month: 'This month', allDates: 'All dates', mine: '✓ My registrations', conference: 'Conference', sport: 'Sport', workshop: 'Workshop', social: 'Social', other: 'Other' },
  de: { all: 'Alle', search: 'Veranstaltung suchen...', week: 'Diese Woche', month: 'Diesen Monat', allDates: 'Alle Daten', mine: '✓ Meine Anmeldungen', conference: 'Konferenz', sport: 'Sport', workshop: 'Workshop', social: 'Sozial', other: 'Andere' },
  lu: { all: 'All', search: 'Evenement sichen...', week: 'Dës Woch', month: 'Dëse Mount', allDates: 'All Datumer', mine: '✓ Meng Umeldungen', conference: 'Konferenz', sport: 'Sport', workshop: 'Workshop', social: 'Sozial', other: 'Aner' },
}

export default function EventFilters({ locale = 'fr' }: { locale?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  const CATEGORIES = [
    { value: '', label: t.all },
    { value: 'conference', label: t.conference },
    { value: 'sport', label: t.sport },
    { value: 'workshop', label: t.workshop },
    { value: 'social', label: t.social },
    { value: 'other', label: t.other },
  ]

  const PERIODS = [
    { value: '', label: t.allDates },
    { value: 'week', label: t.week },
    { value: 'month', label: t.month },
  ]

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const current = {
    category: searchParams.get('category') || '',
    period: searchParams.get('period') || '',
    mine: searchParams.get('mine') || '',
    q: searchParams.get('q') || '',
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder={t.search}
          defaultValue={current.q}
          onChange={e => updateFilter('q', e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat.value}
            onClick={() => updateFilter('category', cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              current.category === cat.value
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <button key={p.value}
            onClick={() => updateFilter('period', p.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              current.period === p.value
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}>
            {p.label}
          </button>
        ))}

        <button
          onClick={() => updateFilter('mine', current.mine === 'true' ? '' : 'true')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            current.mine === 'true'
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
          }`}>
          {t.mine}
        </button>
      </div>
    </div>
  )
}