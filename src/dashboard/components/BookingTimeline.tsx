interface TimelineEntry {
  status: string
  changedAt: string
  changedBy: string
  note?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-white/20' },
  pending: { label: 'Pending', color: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-500' },
  checked_in: { label: 'Checked In', color: 'bg-blue-500' },
  checked_out: { label: 'Checked Out', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
  no_show: { label: 'No Show', color: 'bg-orange-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function BookingTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  if (!timeline || timeline.length === 0) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-white font-display text-base mb-4">Booking Timeline</h3>
      <div className="relative">
        {timeline.map((entry, i) => {
          const config = statusConfig[entry.status] || { label: entry.status, color: 'bg-white/20' }
          const isLast = i === timeline.length - 1
          return (
            <div key={i} className={`flex gap-4 ${isLast ? '' : 'pb-6'}`}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${config.color} ring-2 ring-white/10 shrink-0`} />
                {!isLast && <div className="w-px flex-1 bg-white/10 mt-1" />}
              </div>
              <div className="-mt-1">
                <p className="text-white text-sm font-medium">{config.label}</p>
                <p className="text-white/30 text-xs mt-0.5">{formatDate(entry.changedAt)}</p>
                {entry.note && <p className="text-white/40 text-xs mt-0.5">{entry.note}</p>}
                {entry.changedBy !== 'system' && (
                  <p className="text-white/20 text-[10px] mt-0.5">by {entry.changedBy}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
