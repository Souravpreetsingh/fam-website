import { useState } from 'react'
import { useAdminBookings } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
  completed: 'bg-blue-500/10 text-blue-400',
  no_show: 'bg-orange-500/10 text-orange-400',
  checked_in: 'bg-blue-500/10 text-blue-400',
  checked_out: 'bg-purple-500/10 text-purple-400',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminBookings() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchUserId, setSearchUserId] = useState('')
  const { data, isLoading, error } = useAdminBookings({ page, limit: 15, status: statusFilter || undefined, userId: searchUserId || undefined } as Record<string, string | number | undefined>)

  if (isLoading) return <InlineLoader />
  if (error) return <div className="text-center py-16 text-red-400">Failed to load bookings.</div>

  const bookings = data?.bookings || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Bookings</h1>
        <p className="text-white/40 text-sm mt-1">Manage all reservations</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
          <option value="no_show">No Show</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
        </select>
        <input type="text" placeholder="Search by user ID" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 w-48" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium">Guest</th>
                <th className="text-left px-4 py-3 font-medium">Room</th>
                <th className="text-left px-4 py-3 font-medium">Check In</th>
                <th className="text-left px-4 py-3 font-medium">Check Out</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{(b.user as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-white/70">{(b.room as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-white/60">{formatDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-white/60">{formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-white/70">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      b.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' :
                      b.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      b.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-400' :
                      'bg-white/10 text-white/50'
                    }`}>{b.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[b.status] || ''}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Previous
          </button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
