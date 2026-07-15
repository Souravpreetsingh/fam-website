import { useState } from 'react'
import { useAdminRooms, useUpdateRoomStatus, useBlockForMaintenance, useRemoveMaintenanceBlock } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  occupied: { label: 'Occupied', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  cleaning: { label: 'Cleaning', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  maintenance: { label: 'Maintenance', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  out_of_service: { label: 'Out of Service', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
}

export default function AdminRoomStatus() {
  const { data, isLoading } = useAdminRooms({ limit: 100 } as Record<string, string | number | undefined>)
  const updateStatus = useUpdateRoomStatus()
  const blockMaint = useBlockForMaintenance()
  const removeMaint = useRemoveMaintenanceBlock()

  const [maintModal, setMaintModal] = useState<string | null>(null)
  const [maintStart, setMaintStart] = useState('')
  const [maintEnd, setMaintEnd] = useState('')
  const [maintReason, setMaintReason] = useState('')

  const rooms = (data?.rooms || []) as (import('../../types').Room & { maintenanceBlocks?: { _id: string; startDate: string; endDate: string; reason: string }[] })[]

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status })
  }

  const handleBlockMaintenance = async () => {
    if (!maintModal || !maintStart || !maintEnd) { toast.error('Start and end dates required'); return }
    await blockMaint.mutateAsync({ id: maintModal, data: { startDate: maintStart, endDate: maintEnd, reason: maintReason || undefined } })
    setMaintModal(null)
    setMaintStart('')
    setMaintEnd('')
    setMaintReason('')
  }

  if (isLoading) return <InlineLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Room Status</h1>
        <p className="text-white/40 text-sm mt-1">Manage room availability and maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const cfg = statusConfig[room.status || 'available'] || statusConfig.available
            const maintenanceBlocks = (room as { maintenanceBlocks?: { _id: string; startDate: string; endDate: string; reason: string }[] }).maintenanceBlocks || []

          return (
            <div key={room._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">{room.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{room.totalRooms} room(s)</p>
                </div>
                <select
                  value={room.status || 'available'}
                  onChange={e => handleStatusChange(room._id, e.target.value)}
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${cfg.color} bg-transparent focus:outline-none cursor-pointer`}
                >
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <option key={key} value={key} className="bg-[#0C0E12] text-white">{val.label}</option>
                  ))}
                </select>
              </div>

              {(room.thumbnail as { url?: string })?.url && (
                <div className="h-24 rounded-xl overflow-hidden mb-3">
                  <img src={(room.thumbnail as { url: string }).url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/40">{room.bedType}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/40">{room.capacity.maxGuests} guests</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/40">₹{room.discountPrice || room.pricePerNight}</span>
              </div>

              {maintenanceBlocks.length > 0 && (
                <div className="space-y-1 mb-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Scheduled Maintenance</p>
                  {maintenanceBlocks.map((block) => (
                    <div key={block._id} className="flex items-center justify-between bg-red-500/5 rounded-lg px-2 py-1">
                      <span className="text-white/50 text-[10px]">{new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}</span>
                      <button
                        onClick={() => removeMaint.mutateAsync({ roomId: room._id, blockId: block._id })}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setMaintModal(room._id)} className="w-full px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
                Schedule Maintenance
              </button>
            </div>
          )
        })}
      </div>

      {maintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setMaintModal(null); setMaintStart(''); setMaintEnd(''); setMaintReason('') }} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0C0E12] p-6 shadow-2xl">
            <h3 className="text-white font-display text-lg mb-4">Schedule Maintenance</h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-white/60 text-xs mb-1">Start Date</label>
                <input type="date" value={maintStart} onChange={e => setMaintStart(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">End Date</label>
                <input type="date" value={maintEnd} onChange={e => setMaintEnd(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1">Reason</label>
                <input value={maintReason} onChange={e => setMaintReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50" placeholder="Scheduled maintenance" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setMaintModal(null); setMaintStart(''); setMaintEnd(''); setMaintReason('') }} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleBlockMaintenance} disabled={blockMaint.isPending} className="px-4 py-2 rounded-xl text-sm text-white font-medium bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
                {blockMaint.isPending ? 'Processing...' : 'Block Dates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
