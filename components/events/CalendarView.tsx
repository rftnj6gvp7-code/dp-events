'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Event {
  id: string
  title: string
  date: string
  color: string
  category: string
}

interface Props {
  events: Event[]
  myEventIds: string[]
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS = ['Lu','Ma','Me','Je','Ve','Sa','Di']

export default function CalendarView({ events, myEventIds }: Props) {
  const [current, setCurrent] = useState(new Date())
  const router = useRouter()

  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  function prevMonth() {
    setCurrent(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrent(new Date(year, month + 1, 1))
  }

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Cellules */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEvents = getEventsForDay(day)
          const isToday = dateStr === todayStr
          const isPast = dateStr < todayStr

          return (
            <div key={day}
              className={`min-h-[60px] rounded-lg p-1 ${isToday ? 'bg-brand-50 border border-brand-200' : 'hover:bg-gray-50'} ${isPast ? 'opacity-50' : ''}`}>
              <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-600'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map(e => (
                  <button key={e.id}
                    onClick={() => router.push(`/dashboard/events/${e.id}`)}
                    className="w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium text-white"
                    style={{ backgroundColor: e.color || '#003F8A' }}>
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-gray-400 px-1">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}