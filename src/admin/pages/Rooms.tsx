import { useState } from 'react'
import { useAdminRooms, useDeleteRoom } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'
import RoomForm from './RoomForm'

export default function AdminRooms() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState<'create' | 'edit' | null>(null)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const deleteMutation = useDeleteRoom()
  const { data, isLoading, error } = useAdminRooms({ page, limit: 15, search: search || undefined } as Record<string, string | number | undefined>)

  const rooms = data?.rooms || []
  const pagination = data?.pagination

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget)
    setDeleteTarget(null)
  }

  const openEdit = (id: string) => {
    setEditingRoom(id)
    setFormOpen('edit')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Rooms</h1>
          <p className="text-white/40 text-sm mt-1">Manage accommodations</p>
        </div>
        <button onClick={() => { setEditingRoom(null); setFormOpen('create') }} className="px-4 py-2 rounded-xl bg-[#2E5E4E] text-white text-sm font-medium hover:bg-[#3a705e] transition-all">
          Add Room
        </button>
      </div>

      <input type="text" placeholder="Search rooms..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full max-w-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50" />

      {isLoading ? <InlineLoader /> : error ? <div className="text-center py-16 text-red-400">Failed to load rooms.</div> : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/10">
                  <th className="text-left px-4 py-3 font-medium">Room</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Capacity</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Rating</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No rooms found</td></tr>
                ) : rooms.map((room) => (
                  <tr key={room._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                          {room.thumbnail?.url && <img src={room.thumbnail.url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{room.name}</p>
                          <p className="text-white/30 text-xs">{room.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">₹{room.discountPrice || room.pricePerNight}<span className="text-white/30">/night</span></td>
                    <td className="px-4 py-3 text-white/60">{room.capacity.maxGuests} guests</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${room.isAvailable ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{room.rating.toFixed(1)} ({room.numReviews})</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(room._id)} className="px-3 py-1.5 rounded-lg text-xs text-[#C9A86A] hover:bg-white/5 transition-all mr-2">Edit</button>
                      <button onClick={() => setDeleteTarget(room._id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-white/5 transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Previous</button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Delete Room" message="Are you sure you want to delete this room? This action cannot be undone." variant="danger" loading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {formOpen && <RoomForm roomId={formOpen === 'edit' ? editingRoom : undefined} onClose={() => setFormOpen(null)} />}
    </div>
  )
}
