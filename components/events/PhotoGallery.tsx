'use client'
import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption: string | null
}

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  function prev() {
    setLightbox(l => l !== null ? (l - 1 + photos.length) % photos.length : null)
  }

  function next() {
    setLightbox(l => l !== null ? (l + 1) % photos.length : null)
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">📸 Galerie ({photos.length})</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button key={photo.id} onClick={() => setLightbox(i)}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
            <Image src={photo.url} alt={photo.caption || `Photo ${i+1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <button className="absolute left-4 text-white p-2" onClick={e => { e.stopPropagation(); prev() }}>
            <ChevronLeft size={32} />
          </button>
          <div className="relative max-w-3xl max-h-[80vh] w-full h-full" onClick={e => e.stopPropagation()}>
            <Image src={photos[lightbox].url} alt={photos[lightbox].caption || ''} fill className="object-contain" />
            {photos[lightbox].caption && (
              <p className="absolute bottom-0 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
                {photos[lightbox].caption}
              </p>
            )}
          </div>
          <button className="absolute right-4 text-white p-2" onClick={e => { e.stopPropagation(); next() }}>
            <ChevronRight size={32} />
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
}