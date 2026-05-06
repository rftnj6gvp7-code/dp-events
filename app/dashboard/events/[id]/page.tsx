import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { MapPin, Clock, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import RegisterButton from '@/components/events/RegisterButton'
import WaitlistButton from '@/components/events/WaitlistButton'
import ExportButton from '@/components/events/ExportButton'

export const dynamic = 'force-dynamic'

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, profile:profiles(id, full_name, avatar_url, email)')
    .eq('event_id', event.id)

  const { data: waitlist } = await supabase
    .from('waitlist')
    .select('*, profile:profiles(id, full_name)')
    .eq('event_id', event.id)
    .order('position', { ascending: true })

  const isRegistered = registrations?.some(r => r.user_id === user?.id) || false
  const count = registrations?.length || 0
  const isFull = count >= event.max_attendees
  const isOnWaitlist = waitlist?.some(w => w.user_id === user?.id) || false
  const waitlistPosition = (waitlist?.findIndex(w => w.user_id === user?.id) ?? -1) + 1 || 0
  const waitlistCount = waitlist?.length || 0

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft size={15} /> Retour aux événements
      </Link>

      <div className="card overflow-hidden">
        <div className="relative h-56 bg-gradient-to-br from-brand-100 to-brand-200">
          {event.cover_url ? (
            <Image src={event.cover_url} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">📅</div>
          )}
          {event.is_cancelled && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">❌ Événement annulé</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className={`badge ${(CATEGORY_COLORS as any)[event.category]} mb-2`}>
                {(CATEGORY_LABELS as any)[event.category]}
              </span>
              <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
            </div>
            {!event.is_cancelled && (
              <div className="shrink-0">
                {isRegistered ? (
                  <RegisterButton eventId={event.id} userId={user!.id} isRegistered={true} isFull={false} />
                ) : isFull ? (
                  <WaitlistButton
                    eventId={event.id}
                    userId={user!.id}
                    isOnWaitlist={isOnWaitlist}
                    waitlistPosition={waitlistPosition}
                    waitlistCount={waitlistCount}
                  />
                ) : (
                  <RegisterButton eventId={event.id} userId={user!.id} isRegistered={false} isFull={false} />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Date & heure</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-brand-500" />
                {format(new Date(`${event.date}T${event.time}`), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Lieu</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <MapPin size={13} className="text-brand-500" />
                {event.location}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Places</p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Users size={13} className="text-brand-500" />
                {count} / {event.max_attendees} inscrits
              </p>
            </div>
          </div>

          {event.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Participants */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Participants ({count})</h2>
              <ExportButton
                eventTitle={event.title}
                attendees={registrations?.map(r => ({
                  full_name: (r.profile as any)?.full_name || '',
                  email: (r.profile as any)?.email || '',
                  created_at: r.created_at,
                })) || []}
              />
            </div>
            {count === 0 ? (
              <p className="text-sm text-gray-400">Aucun inscrit pour le moment.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {registrations?.map(r => {
                  const p = r.profile as any
                  const initials = p?.full_name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <div key={r.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                        {initials}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{p?.full_name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Liste d'attente */}
          {waitlistCount > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                ⏳ Liste d'attente ({waitlistCount})
              </h2>
              <div className="flex flex-wrap gap-2">
                {waitlist?.map((w, i) => {
                  const p = w.profile as any
                  const initials = p?.full_name?.split(' ').map((ww: string) => ww[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <div key={w.id} className="flex items-center gap-2 bg-yellow-50 rounded-full px-3 py-1.5">
                      <span className="text-xs text-yellow-600 font-bold">#{i + 1}</span>
                      <span className="text-xs font-medium text-gray-700">{p?.full_name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}