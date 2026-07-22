import { useState } from 'react'
import { useMyBookings, useCreateReview, useUpdateReview, useDeleteReview } from '../api/userDashboardHooks'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import type { Booking } from '../../types'

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={star <= value ? '#C9A86A' : 'none'} stroke={star <= value ? '#C9A86A' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function statusChip(status: string) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>
      {status}
    </span>
  )
}

function getRoomName(b: Booking) {
  if (typeof b.room === 'object' && b.room !== null) {
    return (b.room as { name?: string }).name || 'Room'
  }
  return `Room #${b.room}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface LocalReview {
  id: string
  roomId: string
  roomName: string
  bookingId: string
  rating: number
  title: string
  comment: string
  status: 'approved' | 'pending'
  createdAt: string
}

const REVIEWS_KEY = 'fam_user_reviews'

function getStoredReviews(): LocalReview[] {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveReviews(r: LocalReview[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(r))
}

export default function Reviews() {
  const { data: bookingsData } = useMyBookings({ limit: 100 })
  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()
  const deleteMutation = useDeleteReview()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState('')

  const storedReviews = getStoredReviews()

  const completedBookings = (bookingsData?.results || []).filter(
    b => b.status === 'completed' && !storedReviews.some(r => r.bookingId === b._id)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookingId) { toast.error('Please select a booking'); return }
    if (!comment.trim()) { toast.error('Please write a review'); return }

    const booking = (bookingsData?.results || []).find(b => b._id === selectedBookingId)
    if (!booking) return
    const roomId = typeof booking.room === 'object' ? (booking.room as { _id: string })._id : booking.room

    try {
      await createMutation.mutateAsync({ room: roomId, booking: selectedBookingId, rating, title: title.trim() || undefined, comment: comment.trim() })
      const newReview: LocalReview = {
        id: crypto.randomUUID(),
        roomId,
        roomName: getRoomName(booking),
        bookingId: selectedBookingId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      const existing = getStoredReviews()
      existing.push(newReview)
      saveReviews(existing)
      resetForm()
    } catch {
      // toast handled by mutation
    }
  }

  const handleEdit = (r: LocalReview) => {
    setEditId(r.id)
    setRating(r.rating)
    setTitle(r.title)
    setComment(r.comment)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    const review = storedReviews.find(r => r.id === editId)
    if (!review) return
    try {
      await updateMutation.mutateAsync({ id: editId, data: { rating, title: title.trim() || undefined, comment: comment.trim() } })
      const updated = getStoredReviews().map(r => r.id === editId ? { ...r, rating, title: title.trim(), comment: comment.trim() } : r)
      saveReviews(updated)
      setEditId(null)
      resetForm()
    } catch { /* handled */ }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const review = storedReviews.find(r => r.id === deleteId)
    if (!review) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      const updated = getStoredReviews().filter(r => r.id !== deleteId)
      saveReviews(updated)
      setDeleteId(null)
    } catch { /* handled */ }
  }

  const resetForm = () => {
    setRating(5)
    setTitle('')
    setComment('')
    setSelectedBookingId('')
    setShowForm(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">My Reviews</h1>
          <p className="text-white/40 text-sm mt-1">Share your experience</p>
        </div>
        {completedBookings.length > 0 && !showForm && (
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-white font-display text-base">New Review</h3>
          <div>
            <label className="block text-white/60 text-xs mb-1">Select Booking</label>
            <select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
              <option value="" className="bg-[#0C0E12]">Choose a completed stay...</option>
              {completedBookings.map(b => (
                <option key={b._id} value={b._id} className="bg-[#0C0E12]">{getRoomName(b)} - {formatDate(b.checkIn)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50" placeholder="Great experience!" maxLength={100} />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 resize-none" placeholder="Tell us about your stay..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
              {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {editId && (
        <form onSubmit={handleUpdate} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-white font-display text-base">Edit Review</h3>
          <div>
            <label className="block text-white/60 text-xs mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50" maxLength={100} />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </button>
            <button type="button" onClick={() => { setEditId(null); resetForm() }} className="px-5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {storedReviews.length === 0 ? (
        <EmptyState
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          title="No reviews yet"
          description="Share your experience after your stay."
        />
      ) : (
        <div className="space-y-4">
          {storedReviews.map(review => (
            <div key={review.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">{review.roomName}</p>
                  <p className="text-white/40 text-xs mt-0.5">{formatDate(review.createdAt)}</p>
                </div>
                {statusChip(review.status)}
              </div>
              <StarRating value={review.rating} readonly />
              {review.title && <p className="text-white text-sm mt-2 font-medium">{review.title}</p>}
              <p className="text-white/60 text-sm mt-1">{review.comment}</p>
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                <button onClick={() => handleEdit(review)} className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">Edit</button>
                <button onClick={() => setDeleteId(review.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
