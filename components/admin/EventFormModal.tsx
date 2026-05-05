'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { X, Plus, Pencil } from 'lucide-react'
import { Event, EventCategory, CATEGORY_LABELS } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  event?: Event
}

export default function EventFormModal({ mode, event }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event?.cover_url || null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time?.slice(0, 5) || '',
    location: event?.location || '',
    category: (event?.category || 'conference') as EventCategory,
    max_attendees: event?.max_attendees || 30,
    color: event?.color || '#7c3aed',
    is_cancelled: event?.is_cancelled || false,
  })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File, eventId: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${eventId}/cover.${ext}`
    const { error } = await supabase.storage.from('event-covers').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('event-covers').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date || !form.time || !form.location) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)

    try {
      if (mode === 'create') {
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert({ ...form })
          .select()
          .single()
        if (error) throw error

        let coverUrl = null
        if (imageFile && newEvent) coverUrl = await uploadImage(imageFile, newEvent.id)
        if (coverUrl) await supabase.from('events').update({ cover_url: coverUrl }).eq('id', newEvent.id)

        // Notify all active users
        await fetch('/api/events/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: newEvent.id, type: 'new_event' })
        })
        toast.success('Événement créé !')
      } else if (event) {
        let coverUrl = event.cover_url
        if (imageFile) coverUrl = await uploadImage(imageFile, event.id)

        const wasActive = !event.is_cancelled
        const nowCancelled = form.is_cancelled

        const { error } = await supabase.from('events').update({ ...form, cover_url: coverUrl }).eq('id', event.id)
        if (error) throw error

        if (nowCancelled && wasActive) {
          await fetch('/api/events/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event.id, type: 'event_cancelled' })
          })
        } else {
          await fetch('/api/events/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event.id, type: 'event_modified' })
          })
        }
        toast.success('Événement mis à jour !')
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde.')
    }
    setLoading(false)
  }

  const categories = Object.entries(CATEGORY_LABELS) as [EventCategory, string][]

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={mode === 'create' ? 'btn-primary flex items-center gap-1.5' : 'btn-secondary text-xs py-1 px-2 flex items-center gap-1'}>
        {mode === 'create' ? <><Plus size={15} /> Nouvel événement</> : <><Pencil size={12} /> Modifier</>}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{mode === 'create' ? 'Nouvel événement' : 'Modifier l\'événement'}</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nom de l'événement" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date *</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Heure *</label>
                  <input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>

              <div>
                <label className="label">Lieu *</label>
                <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Salle, adresse, ville…" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Catégorie</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as EventCategory })}>
                    {categories.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Places max</label>
                  <input className="input" type="number" min="1" max="500" value={form.max_attendees} onChange={e => setForm({ ...form, max_attendees: parseInt(e.target.value) || 30 })} />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description de l'événement…" />
              </div>

              <div>
                <label className="label">Couleur de l'événement</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    className="h-9 w-16 cursor-pointer rounded border border-gray-200 p-0.5" />
                  <span className="text-xs text-gray-400">{form.color}</span>
                </div>
              </div>

              <div>
                <label className="label">Photo de couverture</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative h-28 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null) }}
                      className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5"><X size={12} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors">
                    + Ajouter une photo
                  </button>
                )}
              </div>

              {mode === 'edit' && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_cancelled" checked={form.is_cancelled}
                    onChange={e => setForm({ ...form, is_cancelled: e.target.checked })}
                    className="rounded border-gray-300" />
                  <label htmlFor="is_cancelled" className="text-sm text-red-600 font-medium">Annuler cet événement</label>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Sauvegarde…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
