import { useState } from 'react'
import { useAdminBookings, useConfirmBooking, useCheckInBooking, useCheckOutBooking, useMarkNoShow, useMoveBookingRoom } from '../api/adminHooks'
import { bookingsApi } from '../../api/bookings'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const statusStyles: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  pending: 'bg-amber-500/10 text-amber-400',
  confirmed: 'bg-emerald-500/10 text-emerald-400',
  checked_in: 'bg-blue-500/10 text-blue-400',
  checked_out: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
  no_show: 'bg-orange-500/10 text-orange-400',
  expired: 'bg-gray-500/10 text-gray-400',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminBookingManagement() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchUserId, setSearchUserId] = useState('')
  const [showMoveInput, setShowMoveInput] = useState<string | null>(null)
  const [moveRoomId, setMoveRoomId] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useAdminBookings({ page, limit: 15, status: statusFilter || undefined, userId: searchUserId || undefined } as Record<string, string | number | undefined>)
  const confirmMutation = useConfirmBooking()
  const checkInMutation = useCheckInBooking()
  const checkOutMutation = useCheckOutBooking()
  const noShowMutation = useMarkNoShow()
  const moveMutation = useMoveBookingRoom()
  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await bookingsApi.cancel(id, reason)
      return data.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      toast.success('Booking cancelled')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const bookings = data?.bookings || []
  const pagination = data?.pagination

  const handleAction = async (action: string, id: string) => {
    try {
      switch (action) {
        case 'confirm': await confirmMutation.mutateAsync(id); break
        case 'checkin': await checkInMutation.mutateAsync(id); break
        case 'checkout': await checkOutMutation.mutateAsync(id); break
        case 'noshow': await noShowMutation.mutateAsync(id); break
        case 'cancel':
          const reason = prompt('Cancellation reason (optional):')
          await cancelMutation.mutateAsync({ id, reason: reason || undefined })
          break
      }
    } catch { /* handled by mutation */ }
  }

  const handleMoveRoom = async (id: string) => {
    if (!moveRoomId) { toast.error('Enter a room ID'); return }
    await moveMutation.mutateAsync({ id, newRoomId: moveRoomId })
    setShowMoveInput(null)
    setMoveRoomId('')
  }

  const getActions = (status: string) => {
    const actions: { label: string; action: string; color: string }[] = []
    if (status === 'pending') actions.push({ label: 'Confirm', action: 'confirm', color: 'text-emerald-400 hover:bg-emerald-500/10' })
    if (status === 'confirmed' || status === 'pending') actions.push({ label: 'Check In', action: 'checkin', color: 'text-blue-400 hover:bg-blue-500/10' })
    if (status === 'checked_in') actions.push({ label: 'Check Out', action: 'checkout', color: 'text-purple-400 hover:bg-purple-500/10' })
    if (status === 'confirmed') actions.push({ label: 'No Show', action: 'noshow', color: 'text-orange-400 hover:bg-orange-500/10' })
    if (['pending', 'confirmed'].includes(status)) actions.push({ label: 'Cancel', action: 'cancel', color: 'text-red-400 hover:bg-red-500/10' })
    return actions
  }

  if (isLoading) return <InlineLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Booking Management</h1>
        <p className="text-white/40 text-sm mt-1">Manage full booking lifecycle</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="">All Status</option>
          {Object.keys(statusStyles).map(s => (
            <option key={s} value={s} className="bg-[#0C0E12]">{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
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
                <th className="text-left px-4 py-3 font-medium">Dates</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{(b.user as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-white/70">{(b.room as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{formatDate(b.checkIn)} - {formatDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-white/70">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[b.status] || ''}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {getActions(b.status).map((a) => (
                        <button
                          key={a.action}
                          onClick={() => handleAction(a.action, b._id)}
                          className={`px-2 py-1 rounded text-[10px] font-medium ${a.color} border border-white/10 transition-all`}
                        >
                          {a.label}
                        </button>
                      ))}
                      {(b.status === 'confirmed' || b.status === 'pending') && (
                        <>
                          {showMoveInput === b._id ? (
                            <div className="flex gap-1">
                              <input
                                value={moveRoomId}
                                onChange={e => setMoveRoomId(e.target.value)}
                                placeholder="Room ID"
                                className="w-24 px-2 py-1 rounded text-[10px] bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none"
                              />
                              <button onClick={() => handleMoveRoom(b._id)} className="px-2 py-1 rounded text-[10px] text-[#C9A86A] border border-white/10 hover:bg-white/5">Move</button>
                              <button onClick={() => setShowMoveInput(null)} className="px-2 py-1 rounded text-[10px] text-white/40 border border-white/10 hover:bg-white/5">X</button>
                            </div>
                          ) : (
                            <button onClick={() => setShowMoveInput(b._id)} className="px-2 py-1 rounded text-[10px] text-[#C9A86A] border border-white/10 hover:bg-white/5 transition-all">
                              Move Room
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Previous</button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}
    </div>
  )
}
