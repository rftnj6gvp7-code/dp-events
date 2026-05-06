'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Archive, ArchiveRestore } from 'lucide-react'

const TRANSLATIONS: Record<string, any> = {
  fr: { archive: 'Archiver', unarchive: 'Désarchiver', archived: 'Événement archivé.', unarchived: 'Événement désarchivé.', error: 'Erreur.' },
  en: { archive: 'Archive', unarchive: 'Unarchive', archived: 'Event archived.', unarchived: 'Event unarchived.', error: 'Error.' },
  de: { archive: 'Archivieren', unarchive: 'Dearchivieren', archived: 'Veranstaltung archiviert.', unarchived: 'Veranstaltung dearchiviert.', error: 'Fehler.' },
  lu: { archive: 'Archivéieren', unarchive: 'Dearchivéieren', archived: 'Evenement archivéiert.', unarchived: 'Evenement dearchivéiert.', error: 'Feeler.' },
}

export default function ArchiveEventButton({ eventId, isArchived }: { eventId: string; isArchived: boolean }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const locale = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')[1] || 'fr'
    : 'fr'
  const t = TRANSLATIONS[locale] || TRANSLATIONS.fr

  async function handleToggle() {
    setLoading(true)
    const { error } = await supabase.from('events').update({ is_archived: !isArchived }).eq('id', eventId)
    if (error) toast.error(t.error)
    else { toast.success(isArchived ? t.unarchived : t.archived); router.refresh() }
    setLoading(false)
  }

  return (
    <button onClick={handleToggle} disabled={loading}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md font-medium transition-colors ${isArchived ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
      {isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
      {loading ? '…' : isArchived ? t.unarchive : t.archive}
    </button>
  )
}