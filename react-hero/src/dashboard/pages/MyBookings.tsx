import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings, useCancelBooking } from '../api/userDashboardHooks'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Booking } from '../../types'

type Tab = 'all' | 'upcoming' | 'past' | 'cancelled'

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
]

function statusChip(status: string) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    no_show: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    checked_in: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    checked_out: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>
      {status}
    </span>
  )
}

function paymentChip(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>
      {status}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRoomName(b: Booking) {
  if (typeof b.room === 'object' && b.room !== null) {
    return (b.room as { name?: string }).name || 'Room'
  }
  return `Room #${b.room}`
}

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-all">
      <Link to={`/dashboard/booking/${booking._id}`} className="block">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-white font-medium">{getRoomName(booking)}</p>
            <p className="text-white/40 text-xs mt-0.5">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
          </div>
          <div className="flex gap-2">{statusChip(booking.status)}{paymentChip(booking.paymentStatus)}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{booking.nights} night{booking.nights > 1 ? 's' : ''} &middot; {booking.guests.adults} adult{booking.guests.adults > 1 ? 's' : ''}{booking.guests.children ? `, ${booking.guests.children} child` : ''}</span>
          <span className="text-[#C9A86A] font-medium">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </Link>
      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
          <Link to={`/dashboard/booking/${booking._id}`} className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
            Modify
          </Link>
          <button onClick={() => onCancel(booking._id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { data, isLoading } = useMyBookings({ limit: 50 })
  const cancelMutation = useCancelBooking()

  const allBookings = data?.results || []

  const filtered = allBookings.filter(b => {
    const now = new Date()
    switch (activeTab) {
      case 'upcoming': return (b.status === 'confirmed' || b.status === 'pending') && new Date(b.checkIn) > now
      case 'past': return b.status === 'completed' || (new Date(b.checkIn) <= now && b.status !== 'cancelled')
      case 'cancelled': return b.status === 'cancelled' || b.status === 'expired' || b.status === 'no_show'
      default: return true
    }
  })

  const handleCancel = async () => {
    if (!cancelId) return
    await cancelMutation.mutateAsync({ id: cancelId })
    setCancelId(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">My Bookings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your room reservations</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          title="No bookings found"
          description={activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab} bookings to show.`}
          actionLabel={activeTab === 'all' ? 'Browse Rooms' : undefined}
          actionTo={activeTab === 'all' ? '/rooms' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <BookingRow key={b._id} booking={b} onCancel={setCancelId} />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!cancelId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action may be subject to our cancellation policy."
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  )
}
