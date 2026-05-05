export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'active' | 'rejected'
export type EventCategory = 'conference' | 'sport' | 'workshop' | 'social' | 'other'
export type NotificationType = 'new_event' | 'event_modified' | 'event_cancelled' | 'account_validated' | 'info'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  location: string
  category: EventCategory
  max_attendees: number
  cover_url: string | null
  color: string
  is_cancelled: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joins
  registrations?: Registration[]
  registration_count?: number
  is_registered?: boolean
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  created_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string | null
  type: NotificationType
  event_id: string | null
  is_read: boolean
  created_at: string
  event?: Pick<Event, 'id' | 'title'>
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  conference: 'Conférence',
  sport: 'Sport',
  workshop: 'Atelier',
  social: 'Social',
  other: 'Autre',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  conference: 'bg-purple-100 text-purple-800',
  sport: 'bg-green-100 text-green-800',
  workshop: 'bg-blue-100 text-blue-800',
  social: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
}
