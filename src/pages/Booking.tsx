import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import RoomCard from '../components/RoomCard'
import { ROOMS } from '../data/rooms'
import type { Room } from '../data/rooms'

type BookingStep = 'room' | 'dates' | 'guests' | 'info' | 'review'

interface BookingData {
  room: Room | null
  checkIn: Date | null
  checkOut: Date | null
  adults: number
  children: number
  fullName: string
  email: string
  phone: string
  specialRequests: string
}

const STEP_ORDER: BookingStep[] = ['room', 'dates', 'guests', 'info', 'review']

const STEP_TITLES: Record<BookingStep, string> = {
  room: 'Choose Your Room',
  dates: 'Select Dates',
  guests: 'Guests',
  info: 'Guest Information',
  review: 'Review Reservation',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function getNights(checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut) return 0
  return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
}

function CalendarPicker({ value, minDate, onSelect }: { value: Date | null; minDate: Date; onSelect: (d: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(value ? value.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const canPrev = viewYear > minDate.getFullYear() || (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth())

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }}
          disabled={!canPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-white/85 font-body text-sm font-medium">{monthLabel}</span>
        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[11px] text-white/40 font-body font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const d = new Date(viewYear, viewMonth, day); d.setHours(0, 0, 0, 0)
          const disabled = d.getTime() < minDate.getTime()
          const selected = value && value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear
          return (
            <button key={day} disabled={disabled}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={`w-full aspect-square flex items-center justify-center rounded-full text-sm font-body transition-all ${
                selected ? 'bg-[#C9A86A] text-[#06080A] font-semibold' : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >{day}</button>
          )
        })}
      </div>
    </div>
  )
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Booking() {
  const navigate = useNavigate()
  const [step, setStep] = useState<BookingStep>('room')
  const [data, setData] = useState<BookingData>({
    room: null,
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  const update = (partial: Partial<BookingData>) => setData(prev => ({ ...prev, ...partial }))

  const currentIndex = STEP_ORDER.indexOf(step)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === STEP_ORDER.length - 1
  const nights = getNights(data.checkIn, data.checkOut)

  const canProceed = () => {
    switch (step) {
      case 'room': return data.room !== null
      case 'dates': return data.checkIn !== null && data.checkOut !== null
      case 'guests': return data.adults + data.children > 0
      case 'info': return data.fullName.trim().length > 0 && data.email.trim().length > 0 && data.phone.trim().length > 0
      case 'review': return true
    }
  }

  const next = () => {
    if (!canProceed()) return
    if (step === 'review') {
      navigate('/booking/review', { state: { booking: data } })
      return
    }
    const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1)
    setStep(STEP_ORDER[nextIndex])
  }

  const back = () => {
    const prevIndex = Math.max(currentIndex - 1, 0)
    setStep(STEP_ORDER[prevIndex])
  }

  const maxGuests = data.room ? data.room.capacity : 20

  const totalPrice = data.room && nights > 0 ? data.room.price * nights : data.room ? data.room.price : 0

  return (
    <div className="bg-[#06080A] min-h-screen text-white">
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero/luxury-hero.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080A]/70 via-[#06080A]/40 to-[#06080A]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[#C9A86A] font-body text-[11px] md:text-[12px] tracking-[0.25em] uppercase mb-4">Flamingo Aur Maina</span>
          <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-white font-bold tracking-[-0.02em] leading-[1.1] mb-4">
            <span className="bg-gradient-to-r from-[#F5DEB3] via-[#E8A84C] to-[#C8844A] bg-clip-text text-transparent">
              {STEP_TITLES[step]}
            </span>
          </h1>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-24 -mt-12 relative z-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
          {STEP_ORDER.map((s, i) => {
            const idx = STEP_ORDER.indexOf(step)
            const isActive = s === step
            const isDone = i < idx
            return (
              <div key={s} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-2 ${i > 0 ? 'ml-0' : ''}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-400 ${
                    isActive ? 'bg-[#C9A86A] w-3 h-3' : isDone ? 'bg-[#2E5E4E]' : 'bg-white/20'
                  }`} />
                  <span className={`font-body text-[10px] tracking-[0.1em] uppercase hidden md:inline ${
                    isActive ? 'text-[#C9A86A]' : isDone ? 'text-white/60' : 'text-white/30'
                  }`}>{STEP_TITLES[s]}</span>
                </div>
                {i < STEP_ORDER.length - 1 && <div className={`w-6 md:w-10 h-px ${isDone ? 'bg-[#2E5E4E]' : 'bg-white/10'}`} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 1: Room Selection */}
            {step === 'room' && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
                  {ROOMS.map((room, i) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      index={i}
                      selected={data.room?.id === room.id}
                      onSelect={() => update({ room })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Step 2: Dates */}
            {step === 'dates' && (
              <section className="max-w-[800px] mx-auto">
                <div className="relative rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-6 md:p-8">
                  <h3 className="font-display text-lg text-white font-semibold mb-6">Select Your Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-3">Check-In</div>
                      <button onClick={() => {
                        const d = new Date(); d.setHours(0,0,0,0)
                        update({ checkIn: d, checkOut: null })
                      }}
                        className="w-full text-left px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-body text-sm">
                        {data.checkIn ? formatDate(data.checkIn) : 'Select check-in date'}
                      </button>
                      <div className="mt-2">
                        <CalendarPicker
                          value={data.checkIn}
                          minDate={(() => { const d = new Date(); d.setHours(0,0,0,0); return d; })()}
                          onSelect={(d) => update({ checkIn: d, checkOut: data.checkOut && d >= data.checkOut ? null : data.checkOut })}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-3">Check-Out</div>
                      <button disabled={!data.checkIn}
                        className="w-full text-left px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/70 font-body text-sm disabled:opacity-40">
                        {data.checkOut ? formatDate(data.checkOut) : data.checkIn ? 'Select check-out date' : 'Select check-in first'}
                      </button>
                      {data.checkIn && (
                        <div className="mt-2">
                          <CalendarPicker
                            value={data.checkOut}
                            minDate={(() => { const d = new Date(data.checkIn!); d.setDate(d.getDate() + 1); return d; })()}
                            onSelect={(d) => update({ checkOut: d })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {nights > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-[#C9A86A]/80 font-body text-sm">
                      <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Step 3: Guests */}
            {step === 'guests' && (
              <section className="max-w-[500px] mx-auto">
                <div className="relative rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-6 md:p-8">
                  <h3 className="font-display text-lg text-white font-semibold mb-2">Number of Guests</h3>
                  <p className="text-white/40 font-body text-sm mb-6">Maximum {maxGuests} guests for this room.</p>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-body text-sm">Adults</div>
                        <div className="text-white/40 font-body text-[11px]">Age 18+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => update({ adults: Math.max(1, data.adults - 1) })} disabled={data.adults <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                          <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
                        </button>
                        <span className="w-6 text-center text-white font-body text-base tabular-nums">{data.adults}</span>
                        <button onClick={() => {
                          if (data.adults + data.children < maxGuests) update({ adults: data.adults + 1 })
                        }} disabled={data.adults + data.children >= maxGuests}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-body text-sm">Children</div>
                        <div className="text-white/40 font-body text-[11px]">Ages 2–12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => update({ children: Math.max(0, data.children - 1) })} disabled={data.children <= 0}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                          <svg width="10" height="2" viewBox="0 0 10 2" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h8" strokeLinecap="round"/></svg>
                        </button>
                        <span className="w-6 text-center text-white font-body text-base tabular-nums">{data.children}</span>
                        <button onClick={() => {
                          if (data.adults + data.children < maxGuests) update({ children: data.children + 1 })
                        }} disabled={data.adults + data.children >= maxGuests}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 1v8M1 5h8" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-white/30 font-body text-[12px]">
                    Total: {data.adults + data.children} guest{data.adults + data.children !== 1 ? 's' : ''}
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Guest Info */}
            {step === 'info' && (
              <section className="max-w-[500px] mx-auto">
                <div className="relative rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-6 md:p-8">
                  <h3 className="font-display text-lg text-white font-semibold mb-6">Your Details</h3>
                  <div className="space-y-4">
                    <input placeholder="Full Name" value={data.fullName} onChange={e => update({ fullName: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white font-body text-sm placeholder:text-white/25 outline-none focus:border-[#C9A86A]/40 transition-all" />
                    <input placeholder="Email" type="email" value={data.email} onChange={e => update({ email: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white font-body text-sm placeholder:text-white/25 outline-none focus:border-[#C9A86A]/40 transition-all" />
                    <input placeholder="Phone" type="tel" value={data.phone} onChange={e => update({ phone: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white font-body text-sm placeholder:text-white/25 outline-none focus:border-[#C9A86A]/40 transition-all" />
                    <textarea placeholder="Special Requests (optional)" value={data.specialRequests} onChange={e => update({ specialRequests: e.target.value })} rows={3}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white font-body text-sm placeholder:text-white/25 outline-none focus:border-[#C9A86A]/40 transition-all resize-none" />
                  </div>
                </div>
              </section>
            )}

            {/* Step 5: Review */}
            {step === 'review' && (
              <section className="max-w-[520px] mx-auto">
                <div className="relative rounded-[24px] p-[2px] bg-gradient-to-b from-[#C9A86A]/20 to-transparent">
                  <div className="rounded-[22px] bg-[#0A0E14] p-6 md:p-8">
                    <h3 className="font-display text-xl text-white font-semibold mb-6">Review Reservation</h3>
                    <div className="space-y-4">
                      <SummaryRow label="Property" value="Flamingo aur Maina" />
                      <SummaryRow label="Room" value={data.room?.name || '—'} />
                      <SummaryRow label="Room Type" value={data.room?.type || '—'} />
                      <SummaryRow label="Check-In" value={data.checkIn ? formatDate(data.checkIn) : '—'} />
                      <SummaryRow label="Check-Out" value={data.checkOut ? formatDate(data.checkOut) : '—'} />
                      <SummaryRow label="Nights" value={nights > 0 ? `${nights}` : '—'} />
                      <SummaryRow label="Guests" value={`${data.adults + data.children}`} />
                      <SummaryRow label="Price" value={data.room ? `₹${data.room.price.toLocaleString('en-IN')} / night` : '—'} />
                      <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                        <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Taxes</span>
                        <span className="text-white/50 font-body text-sm">Included</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-white font-display text-base font-semibold">Grand Total</span>
                        <span className="text-[#C9A86A] font-display text-xl font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <p className="text-center text-white/25 font-body text-[11px] mt-4">No payment needed yet</p>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className={`flex ${isFirst ? 'justify-center' : 'justify-between'} mt-8 max-w-[520px] mx-auto`}>
          {!isFirst && (
            <button onClick={back}
              className="px-6 py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.06]">
              Back
            </button>
          )}
          <button onClick={next} disabled={!canProceed()}
            className="px-8 py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-[#2E5E4E] to-[#3A7A64] text-white shadow-[0_4px_20px_rgba(46,94,78,0.3)] hover:shadow-[0_8px_32px_rgba(46,94,78,0.45)] hover:scale-[1.03] active:scale-[0.98]">
            {step === 'review' ? 'Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
      <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">{label}</span>
      <span className="text-white/85 font-body text-sm font-medium">{value}</span>
    </div>
  )
}
