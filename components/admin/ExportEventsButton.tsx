'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: string
  max_attendees: number
  description: string | null
  color: string
  is_cancelled: boolean
}

export default function ExportEventsButton({ events }: { events: Event[] }) {
  const [loading, setLoading] = useState(false)

  function handleExport() {
    setLoading(true)
    const data = events.map(e => ({
      'Titre': e.title,
      'Date': e.date,
      'Heure': e.time?.slice(0, 5),
      'Lieu': e.location,
      'Catégorie': e.category,
      'Places max': e.max_attendees,
      'Description': e.description || '',
      'Couleur': e.color,
      'Annulé': e.is_cancelled ? 'oui' : 'non',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Événements')
    XLSX.writeFile(wb, `dp-events-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    setLoading(false)
  }

  return (
    <button onClick={handleExport} disabled={loading}
      className="btn-secondary flex items-center gap-1.5 text-sm">
      <Download size={14} />
      {loading ? 'Export…' : `Exporter (${events.length})`}
    </button>
  )
}