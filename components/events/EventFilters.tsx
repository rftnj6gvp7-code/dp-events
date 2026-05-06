'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'conference', label: 'Conférence' },
  { value: 'sport', label: 'Sport' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Autre' },
]

const PERIODS = [
  { value: '', label: 'Toutes les dates' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
]

export default function EventFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
      {/* Recherche */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Rechercher un événement..."
          defaultValue={current.q}
          onChange={e => updateFilter('q', e.target.value)}
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {/* Catégories */}
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
        {/* Période */}
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

        {/* Mes inscriptions */}
        <button
          onClick={() => updateFilter('mine', current.mine === 'true' ? '' : 'true')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            current.mine === 'true'
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
          }`}>
          ✓ Mes inscriptions
        </button>
      </div>
    </div>
  )
}