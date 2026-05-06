'use client'
import { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Download } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption: string | null
}

export default function ExportPhotosButton({ photos, eventTitle }: { photos: Photo[]; eventTitle: string }) {
  const [loading, setLoading] = useState(false)

  if (photos.length === 0) return null

  async function handleExport() {
    setLoading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder('photos')!

      await Promise.all(photos.map(async (photo, i) => {
        const response = await fetch(photo.url)
        const blob = await response.blob()
        const ext = photo.url.split('.').pop()?.split('?')[0] || 'jpg'
        const name = photo.caption
          ? `${i + 1}-${photo.caption.replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.${ext}`
          : `photo-${i + 1}.${ext}`
        folder.file(name, blob)
      }))

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `photos-${eventTitle.replace(/[^a-z0-9]/gi, '-').slice(0, 30)}.zip`)
    } catch {
      alert('Erreur lors de l\'export.')
    }
    setLoading(false)
  }

  return (
    <button onClick={handleExport} disabled={loading}
      className="btn-secondary flex items-center gap-1.5 text-sm">
      <Download size={14} />
      {loading ? 'Préparation…' : `Télécharger les photos (${photos.length})`}
    </button>
  )
}