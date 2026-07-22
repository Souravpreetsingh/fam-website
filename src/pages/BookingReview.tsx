import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface BookingData {
  room: { name: string; type: string; price: number; capacity: number; image: string } | null
  checkIn: string | null
  checkOut: string | null
  adults: number
  children: number
  fullName: string
  email: string
  phone: string
  specialRequests: string
}

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function getNights(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return 0
  const ci = new Date(checkIn), co = new Date(checkOut)
  return Math.max(0, Math.round((co.getTime() - ci.getTime()) / 86400000))
}

export default function BookingReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.booking as BookingData | undefined

  if (!data || !data.room) {
    return (
      <div className="bg-[#06080A] min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 font-body text-sm mb-4">No booking data found.</p>
          <button onClick={() => navigate('/booking')}
            className="px-6 py-3 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase bg-white/[0.06] border border-white/[0.08] text-white/70">
            Start Booking
          </button>
        </div>
      </div>
    )
  }

  const nights = getNights(data.checkIn, data.checkOut)
  const totalPrice = data.room.price * (nights || 1)

  const handleConfirm = () => {
    navigate('/')
  }

  return (
    <div className="bg-[#06080A] min-h-screen text-white">
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${data.room.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080A]/70 via-[#06080A]/40 to-[#06080A]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="text-[#C9A86A] font-body text-[11px] md:text-[12px] tracking-[0.25em] uppercase mb-4">Flamingo Aur Maina</span>
          <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-white font-bold tracking-[-0.02em] leading-[1.1] mb-4">
            <span className="bg-gradient-to-r from-[#F5DEB3] via-[#E8A84C] to-[#C8844A] bg-clip-text text-transparent">
              Confirm Reservation
            </span>
          </h1>
          <p className="text-white/55 font-body text-[clamp(0.85rem,1.2vw,1.05rem)] max-w-[520px]">Review your booking details before confirming.</p>
        </div>
      </section>

      <div className="max-w-[600px] mx-auto px-4 md:px-8 pb-24 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-[24px] p-[2px] bg-gradient-to-b from-[#C9A86A]/20 to-transparent">
            <div className="rounded-[22px] bg-[#0A0E14] p-6 md:p-8">
              <h2 className="font-display text-xl text-white font-semibold mb-6">Your Reservation</h2>

              <div className="space-y-4">
                <Row label="Property" value="Flamingo aur Maina" />
                <Row label="Room" value={data.room.name} />
                <Row label="Room Type" value={data.room.type} />
                <Row label="Check-In" value={data.checkIn ? formatDate(data.checkIn) : '—'} />
                <Row label="Check-Out" value={data.checkOut ? formatDate(data.checkOut) : '—'} />
                <Row label="Nights" value={`${nights}`} />
                <Row label="Guests" value={`${data.adults + data.children} (${data.adults} Adult${data.adults !== 1 ? 's' : ''}${data.children > 0 ? `, ${data.children} Child${data.children !== 1 ? 'ren' : ''}` : ''})`} />

                <div className="pt-2">
                  <div className="text-white/30 font-body text-[10px] tracking-[0.15em] uppercase mb-2">Guest Details</div>
                  <div className="bg-white/[0.03] rounded-2xl p-4 space-y-2">
                    <p className="text-white/70 font-body text-sm"><span className="text-white/40">Name:</span> {data.fullName}</p>
                    <p className="text-white/70 font-body text-sm"><span className="text-white/40">Email:</span> {data.email}</p>
                    <p className="text-white/70 font-body text-sm"><span className="text-white/40">Phone:</span> {data.phone}</p>
                    {data.specialRequests && (
                      <p className="text-white/70 font-body text-sm"><span className="text-white/40">Requests:</span> {data.specialRequests}</p>
                    )}
                  </div>
                </div>

                <Row label="Price" value={`₹${data.room.price.toLocaleString('en-IN')} / night`} />
                <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                  <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Taxes</span>
                  <span className="text-white/50 font-body text-sm">Included</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-white font-display text-lg font-semibold">Total Amount</span>
                  <span className="text-[#C9A86A] font-display text-2xl font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => navigate('/booking')}
              className="px-6 py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.06]">
              Back
            </button>
            <button onClick={handleConfirm}
              className="px-8 py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 bg-gradient-to-r from-[#2E5E4E] to-[#3A7A64] text-white shadow-[0_4px_20px_rgba(46,94,78,0.3)] hover:shadow-[0_8px_32px_rgba(46,94,78,0.45)] hover:scale-[1.03] active:scale-[0.98]">
              Confirm Reservation
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
      <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">{label}</span>
      <span className="text-white/85 font-body text-sm font-medium text-right">{value}</span>
    </div>
  )
}
