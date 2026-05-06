'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'

export default function PhotoUpload({ eventId, isAdmin, isPast }: { eventId: string; isAdmin: boolean; isPast: boolean }) {
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  if (!isAdmin && !isPast) return null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${eventId}/gallery/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('event-covers')
        .upload(path, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('event-covers').getPublicUrl(path)
      const { error: dbError } = await supabase
        .from('event_photos')
        .insert({ event_id: eventId, url: data.publicUrl, caption: caption || null })
      if (dbError) throw dbError
      toast.success('Photo ajoutée !')
      setFile(null)
      setPreview(null)
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch {
      toast.error("Erreur lors de l'upload.")
    }
    setLoading(false)
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">📸 Ajouter des photos</h2>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" multiple />
      {!preview ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors">
          <Upload size={16} />
          Cliquer pour ajouter une photo
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative h-40 rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={() => { setPreview(null); setFile(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
              <X size={14} />
            </button>
          </div>
          <input className="input" value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Légende (optionnel)" />
          <div className="flex gap-2">
            <button onClick={handleUpload} disabled={loading} className="btn-primary">
              {loading ? 'Upload…' : 'Ajouter la photo'}
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary">
              Changer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}