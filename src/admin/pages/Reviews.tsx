import { useState } from 'react'
import { useAdminReviews, useApproveReview, useDeleteReview } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < rating ? 'text-[#C9A86A]' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function AdminReviews() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminReviews({ page, limit: 15, isApproved: filter || undefined } as Record<string, unknown>)
  const approveMutation = useApproveReview()
  const deleteMutation = useDeleteReview()

  const reviews = data?.reviews || []
  const pagination = data?.pagination

  if (isLoading) return <InlineLoader />
  if (error) return <div className="text-center py-16 text-red-400">Failed to load reviews.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Reviews</h1>
        <p className="text-white/40 text-sm mt-1">Manage guest reviews</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="">All Reviews</option>
          <option value="true">Approved</option>
          <option value="false">Pending Approval</option>
        </select>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-white/30">No reviews found</div>
        ) : reviews.map((review) => (
          <div key={review._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/60">
                  {typeof review.user === 'object' && review.user?.name?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{typeof review.user === 'object' ? review.user?.name : 'Guest'}</p>
                  <p className="text-white/30 text-xs">{typeof review.user === 'object' ? (review.user as { email?: string })?.email || '' : ''}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.title && <p className="text-white text-sm font-medium mb-1">{review.title}</p>}
            <p className="text-white/50 text-sm leading-relaxed mb-3">{review.comment}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>Room: {(typeof review.room === 'object' && review.room !== null ? (review.room as { name?: string })?.name : String(review.room)) || 'N/A'}</span>
                <span>·</span>
                <span>{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                <span>·</span>
                <span className={review.isApproved ? 'text-green-400' : 'text-yellow-400'}>{review.isApproved ? 'Approved' : 'Pending'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approveMutation.mutate(review._id)} disabled={approveMutation.isPending} className="px-3 py-1.5 rounded-lg text-xs text-[#C9A86A] hover:bg-white/5 transition-all disabled:opacity-50">
                  {review.isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button onClick={() => setDeleteTarget(review._id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-white/5 transition-all">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Previous</button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} title="Delete Review" message="Are you sure you want to delete this review?" variant="danger" loading={deleteMutation.isPending} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null) }} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
