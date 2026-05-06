'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

interface Attendee {
  full_name: string
  email: string
  created_at: string
}

interface Props {
  eventTitle: string
  attendees: Attendee[]
}

export default function ExportButton({ eventTitle, attendees }: Props) {
  const [loading, setLoading] = useState(false)

  function handleExport() {
    setLoading(true)
    const data = attendees.map((a, i) => ({
      '#': i + 1,
      'Nom': a.full_name,
      'Email': a.email,
      'Inscrit le': new Date(a.created_at).toLocaleDateString('fr-FR'),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrits')
    XLSX.writeFile(wb, `inscrits-${eventTitle.replace(/\s+/g, '-')}.xlsx`)
    setLoading(false)
  }

  if (attendees.length === 0) return null

  return (
    <button onClick={handleExport} disabled={loading}
      className="btn-secondary flex items-center gap-1.5 text-sm">
      <Download size={14} />
      Exporter ({attendees.length})
    </button>
  )
}