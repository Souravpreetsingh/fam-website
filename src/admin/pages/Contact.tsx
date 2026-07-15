import { useState } from 'react'
import { useAdminContacts, useMarkContactRead } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'

export default function AdminContact() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<{ _id: string; name: string; email: string; phone?: string; subject: string; message: string; createdAt: string } | null>(null)

  const { data, isLoading, error } = useAdminContacts({ page, limit: 15, isRead: filter || undefined })
  const markRead = useMarkContactRead()

  const contacts = data?.contacts || []
  const pagination = data?.pagination

  const handleSelect = (c: typeof selected) => {
    setSelected(c)
    if (c && !c._id) return
    if (c) {
      markRead.mutate(c._id)
    }
  }

  if (isLoading) return <InlineLoader />
  if (error) return <div className="text-center py-16 text-red-400">Failed to load messages.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Contact Messages</h1>
        <p className="text-white/40 text-sm mt-1">Guest inquiries and messages</p>
      </div>

      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="">All Messages</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="px-4 py-12 text-center text-white/30">No messages</div>
            ) : contacts.map((c) => (
              <button key={c._id} onClick={() => handleSelect(c)} className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-white/[0.02] ${!c.isRead ? 'bg-white/[0.03]' : ''} ${selected?._id === c._id ? 'bg-white/[0.05]' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{c.name}</span>
                  {!c.isRead && <span className="w-2 h-2 rounded-full bg-[#C9A86A]" />}
                </div>
                <p className="text-white/40 text-xs mb-0.5">{c.subject}</p>
                <p className="text-white/30 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-display text-lg mb-1">{selected.name}</h3>
                  <p className="text-white/40 text-sm">{selected.email}</p>
                  {selected.phone && <p className="text-white/30 text-xs">{selected.phone}</p>}
                </div>
                <span className="text-white/30 text-xs">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 inline-block">
                <span className="text-white/60 text-sm">{selected.subject}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/30 text-sm">Select a message to view</div>
          )}
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Previous</button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= (pagination?.totalPages || 1)} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}
    </div>
  )
}
