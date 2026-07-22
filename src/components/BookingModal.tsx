import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarPopover, GuestPopover, CounterInput, AnimatedNumber,
  formatDate, addDays, NIGHTLY_RATE,
} from './BookingBar'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

const panelVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    y: '100%', opacity: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.25 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function BookingModal({
  open, onClose,
}: {
  open: boolean; onClose: () => void
}) {
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [openPopover, setOpenPopover] = useState<'checkin' | 'checkout' | 'guests' | null>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const checkInMin = today
  const checkOutMin = checkIn ? addDays(checkIn, 1) : addDays(today, 1)

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalGuests = adults + children
  const estimatedPrice = nights > 0 ? NIGHTLY_RATE * nights * rooms : NIGHTLY_RATE * rooms

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* Reset form on close */
  const handleClose = useCallback(() => {
    setOpenPopover(null)
    onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-[900px] mx-0 sm:mx-4
              bg-[#0F1A2E]/95 backdrop-blur-[24px]
              rounded-t-[32px] sm:rounded-t-[40px]
              border-t border-white/[0.06]
              shadow-[0_-8px_60px_rgba(0,0,0,0.4)]
              overflow-hidden"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-2 sm:px-10 sm:pt-8">
              <div>
                <motion.h2
                  className="font-display text-2xl sm:text-3xl text-white font-semibold tracking-tight"
                  custom={0} variants={fieldVariants} initial="hidden" animate="visible"
                >
                  Book Your Stay
                </motion.h2>
                <motion.p
                  className="text-white/45 font-body text-sm mt-1"
                  custom={1} variants={fieldVariants} initial="hidden" animate="visible"
                >
                  Himalayan Luxury Retreat
                </motion.p>
              </div>
              <motion.button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full
                  bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white
                  transition-all duration-300"
                custom={2} variants={fieldVariants} initial="hidden" animate="visible"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </motion.button>
            </div>

            {/* Form */}
            <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-4 max-h-[70vh] overflow-y-auto">
              {/* Date row */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6"
                custom={3} variants={fieldVariants} initial="hidden" animate="visible"
              >
                {/* Check-In */}
                <div className="relative">
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Check-In</div>
                  <button
                    onClick={() => setOpenPopover(openPopover === 'checkin' ? null : 'checkin')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                      bg-white/[0.05] border border-white/[0.08]
                      hover:bg-white/[0.08] hover:border-white/[0.14]
                      transition-all duration-300 text-left"
                  >
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
                    </svg>
                    <span className={`font-body text-sm ${checkIn ? 'text-white' : 'text-white/35'}`}>
                      {checkIn ? formatDate(checkIn) : 'Select check-in date'}
                    </span>
                  </button>
                  {openPopover === 'checkin' && (
                    <CalendarPopover value={checkIn} minDate={checkInMin} onSelect={setCheckIn} onClose={() => setOpenPopover(null)} dropdownUp={false} />
                  )}
                </div>

                {/* Check-Out */}
                <div className="relative">
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Check-Out</div>
                  <button
                    onClick={() => setOpenPopover(openPopover === 'checkout' ? null : 'checkout')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                      bg-white/[0.05] border border-white/[0.08]
                      hover:bg-white/[0.08] hover:border-white/[0.14]
                      transition-all duration-300 text-left"
                  >
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
                    </svg>
                    <span className={`font-body text-sm ${checkOut ? 'text-white' : 'text-white/35'}`}>
                      {checkOut ? formatDate(checkOut) : 'Select check-out date'}
                    </span>
                  </button>
                  {openPopover === 'checkout' && (
                    <CalendarPopover value={checkOut} minDate={checkOutMin} onSelect={setCheckOut} onClose={() => setOpenPopover(null)} dropdownUp={false} />
                  )}
                </div>
              </motion.div>

              {/* Guests, Rooms, Summary row */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6"
                custom={4} variants={fieldVariants} initial="hidden" animate="visible"
              >
                {/* Guests */}
                <div className="relative">
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Guests</div>
                  <button
                    onClick={() => setOpenPopover(openPopover === 'guests' ? null : 'guests')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                      bg-white/[0.05] border border-white/[0.08]
                      hover:bg-white/[0.08] hover:border-white/[0.14]
                      transition-all duration-300 text-left"
                  >
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                      <circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-white font-body text-sm">{adults + children} Guest{(adults + children) !== 1 ? 's' : ''}</span>
                  </button>
                  {openPopover === 'guests' && (
                    <GuestPopover adults={adults} children={children} onChangeAdults={setAdults} onChangeChildren={setChildren} dropdownUp={false} />
                  )}
                </div>

                {/* Rooms */}
                <div>
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Rooms</div>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl
                    bg-white/[0.05] border border-white/[0.08]">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/40 shrink-0">
                      <rect x="1.5" y="4.5" width="11" height="8" rx="1" /><path d="M4.5 4.5v-2a1 1 0 011-1h3a1 1 0 011 1v2" strokeLinecap="round" />
                    </svg>
                    <CounterInput label="" value={rooms} min={1} max={10} onChange={setRooms} />
                  </div>
                </div>

                {/* Stay Summary */}
                <div>
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Stay Summary</div>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl
                    bg-white/[0.05] border border-white/[0.08] h-[50px]">
                    <div className="flex items-center gap-2 text-white/80 font-body text-[13px]">
                      {nights > 0 && (
                        <>
                          <span><AnimatedNumber value={nights} suffix={nights !== 1 ? ' Nights' : ' Night'} /></span>
                          <span className="text-white/20">·</span>
                        </>
                      )}
                      <span><AnimatedNumber value={totalGuests} suffix={totalGuests !== 1 ? ' Guests' : ' Guest'} /></span>
                      <span className="text-white/20">·</span>
                      <span><AnimatedNumber value={rooms} suffix={rooms !== 1 ? ' Rooms' : ' Room'} /></span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Price & CTA */}
              <motion.div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6
                  p-4 sm:p-6 rounded-2xl
                  bg-gradient-to-r from-white/[0.04] to-white/[0.02]
                  border border-white/[0.06]"
                custom={5} variants={fieldVariants} initial="hidden" animate="visible"
              >
                <div>
                  <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1">Starting From</div>
                  <motion.div
                    key={`${nights}-${rooms}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-white font-display text-2xl sm:text-3xl font-semibold tracking-tight"
                  >
                    ₹{estimatedPrice.toLocaleString('en-IN')}
                  </motion.div>
                  {nights > 0 && (
                    <div className="text-white/30 font-body text-xs mt-0.5">
                      ₹{NIGHTLY_RATE.toLocaleString('en-IN')} / night × {nights} night{nights !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <button className="
                  relative group inline-flex items-center justify-center gap-2.5
                  px-8 py-4 rounded-full
                  bg-gradient-to-r from-[#2E5E4E] to-[#3A7A64]
                  text-white font-body text-[13px] font-medium tracking-[0.12em] uppercase
                  shadow-[0_4px_20px_rgba(46,94,78,0.3)]
                  hover:shadow-[0_8px_32px_rgba(46,94,78,0.45)]
                  hover:scale-[1.03] hover:-translate-y-0.5
                  active:scale-[0.98]
                  transition-all duration-400 ease-out
                  min-w-[180px]
                ">
                  <span className="relative z-10 flex items-center gap-2.5">
                    Check Availability
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h8M7 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="absolute inset-0 rounded-full bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
