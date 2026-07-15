import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBooking, useCancelBooking, useUpdateBooking } from '../api/userDashboardHooks'
import ConfirmModal from '../components/ConfirmModal'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Booking } from '../../types'

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
  return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>{status}</span>
}

function paymentChip(status: string) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>{status}</span>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getRoomData(b: Booking) {
  if (typeof b.room === 'object' && b.room !== null) {
    return b.room as { _id: string; name?: string; slug?: string; images?: { url: string }[]; pricePerNight?: number }
  }
  return { _id: b.room, name: `Room #${b.room}`, slug: '' }
}

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useBooking(id || '')
  const cancelMutation = useCancelBooking()
  const updateMutation = useUpdateBooking()
  const [showCancel, setShowCancel] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-white/40 mb-4">Booking not found</p>
        <Link to="/dashboard/bookings" className="text-[#C9A86A] hover:text-[#d4b87a]">Back to My Bookings</Link>
      </div>
    )
  }

  const room = getRoomData(booking)
  const canModify = booking.status === 'confirmed' || booking.status === 'pending'

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ id: booking._id })
    setShowCancel(false)
  }

  const handleModify = async () => {
    if (!checkIn || !checkOut) return
    await updateMutation.mutateAsync({ id: booking._id, data: { checkIn, checkOut } })
    setIsEditing(false)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const content = `
      <html>
        <head><title>Booking Confirmation - ${booking._id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { font-weight: 600; color: #333; }
          .total { font-size: 18px; font-weight: 700; margin-top: 16px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        </style></head>
        <body>
          <h1>Booking Confirmation</h1>
          <p class="meta">Booking ID: ${booking._id}</p>
          <table>
            <tr><th>Room</th><td>${room.name || 'N/A'}</td></tr>
            <tr><th>Check In</th><td>${formatDate(booking.checkIn)}</td></tr>
            <tr><th>Check Out</th><td>${formatDate(booking.checkOut)}</td></tr>
            <tr><th>Guests</th><td>${booking.guests.adults} Adults${booking.guests.children ? `, ${booking.guests.children} Children` : ''}</td></tr>
            <tr><th>Nights</th><td>${booking.nights}</td></tr>
            <tr><th>Status</th><td>${booking.status}</td></tr>
            <tr><th>Payment</th><td>${booking.paymentStatus}</td></tr>
            <tr><th>Total Amount</th><td>₹${booking.totalAmount.toLocaleString('en-IN')}</td></tr>
            <tr><th>Amount Paid</th><td>₹${booking.amountPaid.toLocaleString('en-IN')}</td></tr>
          </table>
          ${booking.specialRequests ? `<p style="margin-top:16px"><strong>Special Requests:</strong><br>${booking.specialRequests}</p>` : ''}
          <p class="total">Thank you for choosing Flamingo aur Maina</p>
        </body>
      </html>
    `
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" ref={printRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Booking Details</h1>
          <p className="text-white/40 text-xs mt-1 font-mono">ID: {booking._id}</p>
        </div>
        <div className="flex gap-2">{statusChip(booking.status)}{paymentChip(booking.paymentStatus)}</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        {room.images && room.images.length > 0 && (
          <img src={room.images[0].url} alt={room.name || ''} className="w-full h-48 md:h-64 object-cover" />
        )}
        <div className="p-6">
          <h2 className="text-xl font-display text-white mb-1">{room.name || 'Room'}</h2>
          {room.slug && (
            <Link to={`/rooms/${room.slug}`} className="text-sm text-[#C9A86A] hover:text-[#d4b87a]">View Room Details</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-white font-display text-base">Stay Details</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-xs mb-1">Check In</label>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">Check Out</label>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleModify} disabled={updateMutation.isPending} className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-white/50 text-sm">Check In</span><span className="text-white text-sm">{formatDate(booking.checkIn)}</span></div>
              <div className="flex justify-between"><span className="text-white/50 text-sm">Check Out</span><span className="text-white text-sm">{formatDate(booking.checkOut)}</span></div>
              <div className="flex justify-between"><span className="text-white/50 text-sm">Nights</span><span className="text-white text-sm">{booking.nights}</span></div>
              <div className="flex justify-between"><span className="text-white/50 text-sm">Guests</span><span className="text-white text-sm">{booking.guests.adults} Adult{booking.guests.adults > 1 ? 's' : ''}{booking.guests.children ? `, ${booking.guests.children} Child` : ''}</span></div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-white font-display text-base">Payment Info</h3>
          <div className="flex justify-between"><span className="text-white/50 text-sm">Total Amount</span><span className="text-white text-sm font-medium">₹{booking.totalAmount.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-white/50 text-sm">Amount Paid</span><span className="text-white text-sm">₹{booking.amountPaid.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-white/50 text-sm">Due</span><span className="text-white text-sm">₹{(booking.totalAmount - booking.amountPaid).toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-white/50 text-sm">Payment</span>{paymentChip(booking.paymentStatus)}</div>
        </div>
      </div>

      {booking.specialRequests && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-white font-display text-base mb-2">Special Requests</h3>
          <p className="text-white/60 text-sm">{booking.specialRequests}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canModify && (
          <>
            <button onClick={() => { setIsEditing(true); setCheckIn(booking.checkIn.split('T')[0]); setCheckOut(booking.checkOut.split('T')[0]) }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
              Modify Booking
            </button>
            <button onClick={() => setShowCancel(true)} className="px-5 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">
              Cancel Booking
            </button>
          </>
        )}
        <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
          Download Confirmation
        </button>
      </div>

      <ConfirmModal
        open={showCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Cancellation policies will apply."
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />
    </div>
  )
}
