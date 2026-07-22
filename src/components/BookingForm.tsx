import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function CalendarPopover({
  value, minDate, onSelect, onClose,
}: {
  value: Date | null; minDate?: Date; onSelect: (d: Date) => void; onClose: () => void
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const effectiveMin = minDate || today
  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const canPrev = viewYear > effectiveMin.getFullYear() ||
    (viewYear === effectiveMin.getFullYear() && viewMonth > effectiveMin.getMonth())

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 w-[280px] p-4 rounded-2xl z-50
        bg-[#0F1A2E]/95 backdrop-blur-[24px] border border-white/10
        shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }}
          disabled={!canPrev}
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-white/85 font-body text-sm font-medium tracking-wide">{monthLabel}</span>
        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[11px] text-white/40 font-body font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const d = new Date(viewYear, viewMonth, day); d.setHours(0, 0, 0, 0)
          const disabled = d.getTime() < effectiveMin.getTime()
          const selected = value && value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear
          return (
            <button key={day} disabled={disabled}
              onClick={() => { onSelect(new Date(viewYear, viewMonth, day)); onClose() }}
              className={`w-full aspect-square flex items-center justify-center rounded-full text-sm font-body transition-all ${
                selected ? 'bg-[#2E5E4E] text-white font-medium' : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >{day}</button>
          )
        })}
      </div>
    </motion.div>
  )
}

function GuestPopover({
  adults, children, onChangeAdults, onChangeChildren,
}: {
  adults: number; children: number; onChangeAdults: (v: number) => void; onChangeChildren: (v: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 w-[220px] p-4 rounded-2xl z-50
        bg-[#0F1A2E]/95 backdrop-blur-[24px] border border-white/10
        shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-body text-sm">Adults</div>
            <div className="text-white/40 font-body text-[11px]">Age 18+</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onChangeAdults(Math.max(1, adults - 1))} disabled={adults <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
            </button>
            <span className="w-5 text-center text-white font-body text-base tabular-nums">{adults}</span>
            <button onClick={() => onChangeAdults(Math.min(20, adults + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-body text-sm">Children</div>
            <div className="text-white/40 font-body text-[11px]">Ages 2–12</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onChangeChildren(Math.max(0, children - 1))} disabled={children <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
            </button>
            <span className="w-5 text-center text-white font-body text-base tabular-nums">{children}</span>
            <button onClick={() => onChangeChildren(Math.min(10, children + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export interface BookingFormData {
  checkIn: Date | null
  checkOut: Date | null
  adults: number
  children: number
  rooms: number
}

export default function BookingForm({
  data, onChange,
}: {
  data: BookingFormData
  onChange: (d: BookingFormData) => void
}) {
  const [openPopover, setOpenPopover] = useState<'checkin' | 'checkout' | 'guests' | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const checkInMin = today
  const checkOutMin = data.checkIn ? addDays(data.checkIn, 1) : addDays(today, 1)

  const nights = data.checkIn && data.checkOut
    ? Math.max(0, Math.round((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setOpenPopover(null)
    }
  }, [])
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const update = (partial: Partial<BookingFormData>) => onChange({ ...data, ...partial })

  const fieldStyle = (isOpen?: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer ${
      isOpen
        ? 'bg-white/[0.1] border border-[#C9A86A]/40'
        : 'bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14]'
    }`

  return (
    <div ref={popoverRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5">
        <div className="relative">
          <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Check-In</div>
          <button onClick={() => setOpenPopover(openPopover === 'checkin' ? null : 'checkin')}
            className={fieldStyle(openPopover === 'checkin')}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
            </svg>
            <span className={`font-body text-sm ${data.checkIn ? 'text-white' : 'text-white/35'}`}>
              {data.checkIn ? formatDate(data.checkIn) : 'Select check-in date'}
            </span>
          </button>
          <AnimatePresence>{openPopover === 'checkin' && (
            <CalendarPopover value={data.checkIn} minDate={checkInMin} onSelect={(d) => { update({ checkIn: d })}} onClose={() => setOpenPopover(null)} />
          )}</AnimatePresence>
        </div>
        <div className="relative">
          <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Check-Out</div>
          <button onClick={() => setOpenPopover(openPopover === 'checkout' ? null : 'checkout')}
            className={fieldStyle(openPopover === 'checkout')}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
            </svg>
            <span className={`font-body text-sm ${data.checkOut ? 'text-white' : 'text-white/35'}`}>
              {data.checkOut ? formatDate(data.checkOut) : 'Select check-out date'}
            </span>
          </button>
          <AnimatePresence>{openPopover === 'checkout' && (
            <CalendarPopover value={data.checkOut} minDate={checkOutMin} onSelect={(d) => { update({ checkOut: d })}} onClose={() => setOpenPopover(null)} />
          )}</AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div className="relative">
          <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Guests</div>
          <button onClick={() => setOpenPopover(openPopover === 'guests' ? null : 'guests')}
            className={fieldStyle(openPopover === 'guests')}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
              <circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round" />
            </svg>
            <span className="text-white font-body text-sm">{data.adults + data.children} Guest{(data.adults + data.children) !== 1 ? 's' : ''}</span>
          </button>
          <AnimatePresence>{openPopover === 'guests' && (
            <GuestPopover adults={data.adults} children={data.children} onChangeAdults={(v) => update({ adults: v })} onChangeChildren={(v) => update({ children: v })} />
          )}</AnimatePresence>
        </div>
        <div>
          <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Rooms</div>
          <div className={fieldStyle()}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
              <rect x="1.5" y="4.5" width="11" height="8" rx="1" /><path d="M4.5 4.5v-2a1 1 0 011-1h3a1 1 0 011 1v2" strokeLinecap="round" />
            </svg>
            <div className="flex items-center gap-2">
              <button onClick={() => update({ rooms: Math.max(1, data.rooms - 1) })}
                disabled={data.rooms <= 1}
                className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
              </button>
              <span className="w-5 text-center text-white font-body text-sm tabular-nums">{data.rooms}</span>
              <button onClick={() => update({ rooms: Math.min(10, data.rooms + 1) })}
                className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {nights > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 flex items-center gap-2 text-white/50 font-body text-sm"
        >
          <span className="text-[#C9A86A]">{nights} night{nights !== 1 ? 's' : ''}</span>
          <span className="text-white/20">·</span>
          <span>{data.adults + data.children} guest{(data.adults + data.children) !== 1 ? 's' : ''}</span>
          <span className="text-white/20">·</span>
          <span>{data.rooms} room{data.rooms !== 1 ? 's' : ''}</span>
        </motion.div>
      )}
    </div>
  )
}
