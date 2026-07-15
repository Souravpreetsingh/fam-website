import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

/* ─── Date Utilities ─── */

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

function isBeforeDay(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/* ─── Calendar Popover ─── */

function CalendarPopover({
  value,
  minDate,
  onSelect,
  onClose,
}: {
  value: Date | null
  minDate?: Date
  onSelect: (d: Date) => void
  onClose: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const effectiveMin = minDate || today

  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const canPrev = viewYear > effectiveMin.getFullYear() ||
    (viewYear === effectiveMin.getFullYear() && viewMonth > effectiveMin.getMonth())

  const handlePrev = () => {
    if (!canPrev) return
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const handleNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0, 0, 0, 0)
    return isBeforeDay(d, effectiveMin)
  }

  const isSelected = (day: number) => {
    if (!value) return false
    return value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-full left-0 mb-2 w-[280px] p-4 rounded-2xl z-50
        bg-white/[0.08] backdrop-blur-[24px] border border-white/12
        shadow-[0_12px_48px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.15)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={handlePrev} disabled={!canPrev}
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-white/85 font-body text-sm font-medium tracking-wide">{monthLabel}</span>
        <button onClick={handleNext}
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[11px] text-white/40 font-body font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const disabled = isDisabled(day)
          const selected = isSelected(day)
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => { onSelect(new Date(viewYear, viewMonth, day)); onClose() }}
              className={`
                w-full aspect-square flex items-center justify-center rounded-full text-sm font-body transition-all
                ${selected ? 'bg-[#2E5E4E] text-white font-medium' : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/10'}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── Counter Input ─── */

function CounterInput({
  label, value, min, max, onChange, icon,
}: {
  label: string; value: number; min: number; max?: number; onChange: (v: number) => void; icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-white/50 shrink-0">{icon}</span>}
      {label && <span className="text-white/50 font-body text-[11px] tracking-wide uppercase min-w-[44px]">{label}</span>}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
        </button>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-5 text-center text-white font-body text-sm font-medium tabular-nums"
        >
          {value}
        </motion.span>
        <button
          onClick={() => onChange(Math.min(max ?? 99, value + 1))}
          disabled={max !== undefined && value >= max}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  )
}

/* ─── Guest Popover ─── */

function GuestPopover({
  adults, children, onChangeAdults, onChangeChildren,
}: {
  adults: number; children: number
  onChangeAdults: (v: number) => void
  onChangeChildren: (v: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-full left-0 mb-2 w-[220px] p-4 rounded-2xl z-50
        bg-white/[0.08] backdrop-blur-[24px] border border-white/12
        shadow-[0_12px_48px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.15)]"
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
            <motion.span
              key={adults}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="w-5 text-center text-white font-body text-base tabular-nums"
            >
              {adults}
            </motion.span>
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
            <motion.span
              key={children}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="w-5 text-center text-white font-body text-base tabular-nums"
            >
              {children}
            </motion.span>
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

/* ─── Animated Number ─── */

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="tabular-nums"
    >
      {value}{suffix || ''}
    </motion.span>
  )
}

/* ─── Main Booking Bar ─── */

const NIGHTLY_RATE = 6000

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)

  const [openPopover, setOpenPopover] = useState<'checkin' | 'checkout' | 'guests' | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const checkInMin = today
  const checkOutMin = checkIn ? addDays(checkIn, 1) : addDays(today, 1)

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalGuests = adults + children
  const estimatedPrice = nights > 0 ? NIGHTLY_RATE * nights * rooms : NIGHTLY_RATE * rooms

  /* Close popovers on outside click */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setOpenPopover(null)
    }
  }, [])
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const summaryVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-4 md:px-6">
      <div className="mx-auto max-w-[1250px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] p-1.5 md:p-2
            bg-white/[0.07] backdrop-blur-[18px]
            border border-white/[0.08]
            shadow-[0_8px_40px_rgba(0,0,0,0.2),0_2px_12px_rgba(0,0,0,0.1)]
            transition-shadow duration-500"
          ref={popoverRef}
        >
          {/* Glass inner container */}
          <div className="rounded-[24px] bg-white/[0.03] backdrop-blur-[6px] p-3 md:p-4">

            {/* Desktop flex row */}
            <div className="hidden lg:flex items-center gap-0">

              {/* Check-In */}
              <div className="flex-1 min-w-0 px-2 relative">
                <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-In</div>
                <button
                  onClick={() => setOpenPopover(openPopover === 'checkin' ? null : 'checkin')}
                  className="w-full flex items-center gap-2 text-left text-white font-body text-sm py-0.5 hover:text-white/90 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
                  </svg>
                  <span className={checkIn ? 'text-white' : 'text-white/35'}>{checkIn ? formatDate(checkIn) : 'Select date'}</span>
                </button>
                {openPopover === 'checkin' && (
                  <CalendarPopover value={checkIn} minDate={checkInMin} onSelect={setCheckIn} onClose={() => setOpenPopover(null)} />
                )}
              </div>

              <div className="w-px h-8 bg-white/[0.06] shrink-0" />

              {/* Check-Out */}
              <div className="flex-1 min-w-0 px-2 relative">
                <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-Out</div>
                <button
                  onClick={() => setOpenPopover(openPopover === 'checkout' ? null : 'checkout')}
                  className="w-full flex items-center gap-2 text-left text-white font-body text-sm py-0.5 hover:text-white/90 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
                  </svg>
                  <span className={checkOut ? 'text-white' : 'text-white/35'}>{checkOut ? formatDate(checkOut) : 'Select date'}</span>
                </button>
                {openPopover === 'checkout' && (
                  <CalendarPopover value={checkOut} minDate={checkOutMin} onSelect={setCheckOut} onClose={() => setOpenPopover(null)} />
                )}
              </div>

              <div className="w-px h-8 bg-white/[0.06] shrink-0" />

              {/* Guests */}
              <div className="flex-1 min-w-0 px-2 relative">
                <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Guests</div>
                <button
                  onClick={() => setOpenPopover(openPopover === 'guests' ? null : 'guests')}
                  className="w-full flex items-center gap-2 text-left text-white font-body text-sm py-0.5 hover:text-white/90 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                    <circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-white">{adults + children} Guest{(adults + children) !== 1 ? 's' : ''}</span>
                </button>
                {openPopover === 'guests' && (
                  <GuestPopover adults={adults} children={children} onChangeAdults={setAdults} onChangeChildren={setChildren} />
                )}
              </div>

              <div className="w-px h-8 bg-white/[0.06] shrink-0" />

              {/* Rooms */}
              <div className="flex-1 min-w-0 px-2">
                <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Rooms</div>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                    <rect x="1.5" y="4.5" width="11" height="8" rx="1" /><path d="M4.5 4.5v-2a1 1 0 011-1h3a1 1 0 011 1v2" strokeLinecap="round" />
                  </svg>
                  <CounterInput label="" value={rooms} min={1} max={10} onChange={setRooms} />
                </div>
              </div>

              <div className="w-px h-8 bg-white/[0.06] shrink-0" />

              {/* Stay Summary */}
              <div className="flex-[1.2] min-w-0 px-2">
                <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Stay Summary</div>
                <motion.div variants={summaryVariants} initial="hidden" animate="visible" className="flex items-center gap-2.5 text-white/80 font-body text-[13px]">
                  {nights > 0 ? (
                    <>
                      <span><AnimatedNumber value={nights} suffix=" Night{nights !== 1 ? 's' : ''}" /></span>
                      <span className="text-white/20">·</span>
                    </>
                  ) : null}
                  <span><AnimatedNumber value={totalGuests} suffix=" Guest{(adults + children) !== 1 ? 's' : ''}" /></span>
                  <span className="text-white/20">·</span>
                  <span><AnimatedNumber value={rooms} suffix=" Room{rooms !== 1 ? 's' : ''}" /></span>
                </motion.div>
              </div>

              <div className="w-px h-8 bg-white/[0.06] shrink-0" />

              {/* Price + Button */}
              <div className="flex-none min-w-[200px] pl-2 flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase">Starting From</div>
                  <motion.div
                    key={`${nights}-${rooms}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-white font-display text-lg font-semibold tracking-tight"
                  >
                    ₹{estimatedPrice.toLocaleString('en-IN')}
                  </motion.div>
                </div>
                <button className="
                  relative group inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-full min-w-[150px]
                  bg-[#2E5E4E] text-white font-body text-[12px] font-medium tracking-[0.12em] uppercase
                  shadow-[0_4px_16px_rgba(46,94,78,0.3)]
                  hover:shadow-[0_8px_28px_rgba(46,94,78,0.45)]
                  hover:scale-[1.03] hover:-translate-y-0.5
                  active:scale-[0.98]
                  transition-all duration-400 ease-out
                ">
                  <span className="relative z-10 flex items-center gap-2">
                    Check Availability
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="absolute inset-0 rounded-full bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </button>
              </div>
            </div>

            {/* Tablet layout (md) */}
            <div className="hidden md:flex lg:hidden flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-In</div>
                  <button onClick={() => setOpenPopover(openPopover === 'checkin' ? null : 'checkin')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round"/></svg>
                    <span className={checkIn ? 'text-white' : 'text-white/35'}>{checkIn ? formatDate(checkIn) : 'Select date'}</span>
                  </button>
                  {openPopover === 'checkin' && <CalendarPopover value={checkIn} minDate={checkInMin} onSelect={setCheckIn} onClose={() => setOpenPopover(null)} />}
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-1 relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-Out</div>
                  <button onClick={() => setOpenPopover(openPopover === 'checkout' ? null : 'checkout')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round"/></svg>
                    <span className={checkOut ? 'text-white' : 'text-white/35'}>{checkOut ? formatDate(checkOut) : 'Select date'}</span>
                  </button>
                  {openPopover === 'checkout' && <CalendarPopover value={checkOut} minDate={checkOutMin} onSelect={setCheckOut} onClose={() => setOpenPopover(null)} />}
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-1 relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Guests</div>
                  <button onClick={() => setOpenPopover(openPopover === 'guests' ? null : 'guests')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round"/></svg>
                    <span className="text-white">{adults + children} Guest{(adults + children) !== 1 ? 's' : ''}</span>
                  </button>
                  {openPopover === 'guests' && <GuestPopover adults={adults} children={children} onChangeAdults={setAdults} onChangeChildren={setChildren} />}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Rooms</div>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><rect x="1.5" y="4.5" width="11" height="8" rx="1" /><path d="M4.5 4.5v-2a1 1 0 011-1h3a1 1 0 011 1v2" strokeLinecap="round" /></svg>
<CounterInput label="" value={rooms} min={1} max={10} onChange={setRooms} />
                  </div>
                </div>
                <div className="w-px h-8 bg-white/[0.06] shrink-0" />
                <div className="flex-[2]">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Stay Summary</div>
                  <motion.div variants={summaryVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-white/80 font-body text-[13px]">
                    {nights > 0 ? <><span><AnimatedNumber value={nights} suffix="N" /></span><span className="text-white/20">·</span></> : null}
                    <span><AnimatedNumber value={totalGuests} suffix="G" /></span>
                    <span className="text-white/20">·</span>
                    <span><AnimatedNumber value={rooms} suffix="R" /></span>
                    <span className="text-white/20">·</span>
                    <span className="text-white font-display text-sm font-semibold">₹{estimatedPrice.toLocaleString('en-IN')}</span>
                  </motion.div>
                </div>
                <button className="relative group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2E5E4E] text-white font-body text-xs font-medium tracking-[0.12em] uppercase shadow-[0_4px_16px_rgba(46,94,78,0.3)] hover:shadow-[0_8px_28px_rgba(46,94,78,0.45)] hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-400 ease-out">
                  <span className="relative z-10 flex items-center gap-2">
                    Check
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="absolute inset-0 rounded-full bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </button>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-In</div>
                  <button onClick={() => setOpenPopover(openPopover === 'checkin' ? null : 'checkin')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round"/></svg>
                    <span className={checkIn ? 'text-white' : 'text-white/35'}>{checkIn ? formatDate(checkIn) : 'Select date'}</span>
                  </button>
                  {openPopover === 'checkin' && <CalendarPopover value={checkIn} minDate={checkInMin} onSelect={setCheckIn} onClose={() => setOpenPopover(null)} />}
                </div>
                <div className="relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Check-Out</div>
                  <button onClick={() => setOpenPopover(openPopover === 'checkout' ? null : 'checkout')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round"/></svg>
                    <span className={checkOut ? 'text-white' : 'text-white/35'}>{checkOut ? formatDate(checkOut) : 'Select date'}</span>
                  </button>
                  {openPopover === 'checkout' && <CalendarPopover value={checkOut} minDate={checkOutMin} onSelect={setCheckOut} onClose={() => setOpenPopover(null)} />}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Guests</div>
                  <button onClick={() => setOpenPopover(openPopover === 'guests' ? null : 'guests')}
                    className="flex items-center gap-2 text-white font-body text-sm py-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0"><circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round"/></svg>
                    <span className="text-white">{adults + children}</span>
                  </button>
                  {openPopover === 'guests' && <GuestPopover adults={adults} children={children} onChangeAdults={setAdults} onChangeChildren={setChildren} />}
                </div>
                <div>
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Rooms</div>
                  <CounterInput label="" value={rooms} min={1} max={10} onChange={setRooms} />
                </div>
                <div>
                  <div className="text-white/45 font-body text-[10px] tracking-[0.15em] uppercase mb-0.5">Price</div>
                  <motion.div
                    key={`${nights}-${rooms}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white font-display text-base font-semibold"
                  >
                    ₹{estimatedPrice.toLocaleString('en-IN')}
                  </motion.div>
                </div>
              </div>
              <button className="relative group w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#2E5E4E] text-white font-body text-xs font-medium tracking-[0.12em] uppercase shadow-[0_4px_16px_rgba(46,94,78,0.3)] hover:shadow-[0_8px_28px_rgba(46,94,78,0.45)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-400 ease-out">
                <span className="relative z-10 flex items-center gap-2">
                  Check Availability
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="absolute inset-0 rounded-full bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
