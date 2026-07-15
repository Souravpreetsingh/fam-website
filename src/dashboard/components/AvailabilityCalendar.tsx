import { useState } from 'react'

interface CalendarDay {
  date: string
  available: boolean
  booked: boolean
  bookingCount: number
  maintenance: boolean
  checkIns: { bookingId: string; guest: string }[]
  checkOuts: { bookingId: string; guest: string }[]
}

interface RoomCalendar {
  room: { _id: string; name: string; slug: string; status: string; totalRooms: number }
  days: CalendarDay[]
}

interface Props {
  data: RoomCalendar[]
  month: number
  year: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AvailabilityCalendar({ data, month, year, onPrevMonth, onNextMonth }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const filteredData = selectedRoom === 'all' ? data : data.filter(r => r.room._id === selectedRoom)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onPrevMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h3 className="text-white font-display text-base">{months[month]} {year}</h3>
          <button onClick={onNextMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="all" className="bg-[#0C0E12]">All Rooms</option>
          {data.map(r => (
            <option key={r.room._id} value={r.room._id} className="bg-[#0C0E12]">{r.room.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-px min-w-[600px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-white/30 text-xs font-medium py-2">{day}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const roomDays = filteredData.map(r => r.days.find(d => d.date === dateStr)).filter(Boolean) as CalendarDay[]
            const isAvailable = roomDays.every(d => d.available)
            const isBooked = roomDays.some(d => d.booked)
            const isMaintenance = roomDays.some(d => d.maintenance)
            const checkInCount = roomDays.reduce((s, d) => s + d.checkIns.length, 0)
            const checkOutCount = roomDays.reduce((s, d) => s + d.checkOuts.length, 0)

            let bg = 'bg-white/[0.02]'
            if (isMaintenance) bg = 'bg-red-500/10'
            else if (!isAvailable) bg = 'bg-amber-500/10'
            else if (isBooked) bg = 'bg-emerald-500/10'

            return (
              <div key={day} className={`aspect-square ${bg} border border-white/5 p-1 flex flex-col items-center justify-center text-center`}>
                <span className="text-white/60 text-xs font-medium">{day}</span>
                {checkInCount > 0 && <span className="text-[8px] text-blue-400 leading-tight">↓{checkInCount}</span>}
                {checkOutCount > 0 && <span className="text-[8px] text-purple-400 leading-tight">↑{checkOutCount}</span>}
                {isMaintenance && <span className="text-[8px] text-red-400 leading-tight">MNT</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/50" /> Available</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/50" /> Partially Booked</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500/30 border border-red-500/50" /> Maintenance</div>
      </div>
    </div>
  )
}
