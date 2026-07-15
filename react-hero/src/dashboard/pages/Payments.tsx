import { useMyBookings } from '../api/userDashboardHooks'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Booking } from '../../types'

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

function bookingStatusChip(status: string) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    refunded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
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

export default function Payments() {
  const { data, isLoading } = useMyBookings({ limit: 100 })
  const bookings = data?.results || []
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'partial' || b.paymentStatus === 'refunded')

  const handleDownloadInvoice = (booking: Booking) => {
    const content = `
      <html>
        <head>
          <title>Invoice - ${booking._id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; max-width: 700px; margin: 0 auto; }
            .header { border-bottom: 2px solid #C9A86A; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { font-size: 24px; margin: 0; }
            .meta { color: #666; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 13px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            .total { font-size: 18px; font-weight: 700; text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #333; }
            .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Flamingo aur Maina</h1>
            <p class="meta">Invoice</p>
          </div>
          <p><strong>Invoice ID:</strong> INV-${booking._id.slice(-8).toUpperCase()}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Date:</strong> ${formatDate(booking.createdAt)}</p>
          <table>
            <tr><th>Description</th><th>Details</th><th>Amount</th></tr>
            <tr><td>Room</td><td>${getRoomName(booking)}</td><td>₹${booking.totalAmount.toLocaleString('en-IN')}</td></tr>
            <tr><td>Check In</td><td>${formatDate(booking.checkIn)}</td><td></td></tr>
            <tr><td>Check Out</td><td>${formatDate(booking.checkOut)}</td><td></td></tr>
            <tr><td>Nights</td><td>${booking.nights}</td><td></td></tr>
            <tr><td>Guests</td><td>${booking.guests.adults} Adult${booking.guests.adults > 1 ? 's' : ''}${booking.guests.children ? `, ${booking.guests.children} Child` : ''}</td><td></td></tr>
          </table>
          <div class="total">Total: ₹${booking.totalAmount.toLocaleString('en-IN')}</div>
          <p><strong>Paid:</strong> ₹${booking.amountPaid.toLocaleString('en-IN')}</p>
          <p><strong>Status:</strong> ${booking.paymentStatus}</p>
          <div class="footer">Thank you for choosing Flamingo aur Maina</div>
        </body>
      </html>
    `
    const w = window.open('', '_blank')
    if (w) { w.document.write(content); w.document.close(); w.focus() }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">Payment History</h1>
        <p className="text-white/40 text-sm mt-1">View your transaction history and download invoices</p>
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
      ) : paidBookings.length === 0 ? (
        <EmptyState
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          title="No payment records"
          description="Your payment history will appear here after your first booking."
        />
      ) : (
        <div className="space-y-3">
          {paidBookings.map(booking => (
            <div key={booking._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-medium">{getRoomName(booking)}</p>
                  <p className="text-white/40 text-xs mt-0.5">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
                </div>
                <div className="flex gap-2">{paymentChip(booking.paymentStatus)}{bookingStatusChip(booking.status)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/40">
                  <span className="text-white/60">{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                  <span className="mx-2">&middot;</span>
                  <span className="text-white/60">Paid: ₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                  {booking.totalAmount > booking.amountPaid && (
                    <span className="text-amber-400 ml-2">Due: ₹{(booking.totalAmount - booking.amountPaid).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C9A86A] font-medium text-sm">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                  <button onClick={() => handleDownloadInvoice(booking)} className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
                    Invoice
                  </button>
                </div>
              </div>
              {booking.paymentStatus === 'refunded' && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-purple-400">
                  This payment has been refunded.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
