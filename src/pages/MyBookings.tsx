import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings, useCancelBooking } from '../hooks/useBookings'
import { BookingCardSkeleton } from '../components/ui/Skeleton'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  no_show: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  checked_in: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checked_out: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function MyBookings() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const { data, isLoading, error } = useMyBookings({ status: statusFilter })
  const cancelMutation = useCancelBooking()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const bookings = data?.results || []

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    await cancelMutation.mutateAsync({ id })
    setCancellingId(null)
  }

  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-white mb-2">My Bookings</h1>
            <p className="text-white/50 text-sm">Manage your reservations</p>
          </div>
          <div className="flex gap-2">
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s || undefined)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (s === '' && !statusFilter) || s === statusFilter
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/40 hover:text-white/70'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">Failed to load bookings.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/40 mb-4">No bookings found.</p>
            <Link to="/rooms" className="inline-block px-6 py-2.5 rounded-full bg-[#2E5E4E] text-white text-sm hover:bg-[#3a705e] transition-all">
              Book a Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => {
              const roomName = typeof booking.room === 'object' ? booking.room?.name : 'Room'
              const roomSlug = typeof booking.room === 'object' ? booking.room?.slug : '#'
              return (
                <div key={booking._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link to={`/rooms/${roomSlug}`} className="font-display text-lg text-white hover:text-[#C9A86A] transition-colors">
                        {roomName}
                      </Link>
                      <p className="text-white/40 text-xs mt-1">
                        Booked on {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[booking.status] || ''}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider">Check-in</p>
                      <p className="text-white">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider">Check-out</p>
                      <p className="text-white">{formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider">Guests</p>
                      <p className="text-white">{booking.guests.adults} Adults{booking.guests.children ? `, ${booking.guests.children} Children` : ''}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider">Total</p>
                      <p className="text-[#C9A86A] font-medium">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
