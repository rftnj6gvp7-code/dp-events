'use client'
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'

export default function ImportEventsButton() {
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws) as any[]

      if (rows.length === 0) {
        toast.error('Fichier vide.')
        setLoading(false)
        return
      }

      const events = rows.map(row => ({
        title: row['Titre'] || '',
        date: row['Date'] || '',
        time: row['Heure'] || '09:00',
        location: row['Lieu'] || '',
        category: row['Catégorie'] || 'other',
        max_attendees: parseInt(row['Places max']) || 30,
        description: row['Description'] || null,
        color: row['Couleur'] || '#003F8A',
        is_cancelled: row['Annulé'] === 'oui',
      })).filter(e => e.title && e.date)

      const { error } = await supabase.from('events').insert(events)

      if (error) {
        toast.error('Erreur lors de l\'import.')
      } else {
        toast.success(`${events.length} événement(s) importé(s) !`)
        router.refresh()
      }
    } catch {
      toast.error('Fichier invalide.')
    }

    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={handleImport} className="hidden" />
      <button onClick={() => fileRef.current?.click()} disabled={loading}
        className="btn-secondary flex items-center gap-1.5 text-sm">
        <Upload size={14} />
        {loading ? 'Import…' : 'Importer CSV/Excel'}
      </button>
    </>
  )
}