const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-white/10 text-white/60 border-white/10' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  checked_in: { label: 'Checked In', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  checked_out: { label: 'Checked Out', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  completed: { label: 'Completed', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  no_show: { label: 'No Show', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  expired: { label: 'Expired', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
}

export default function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-white/5 text-white/50 border-white/10' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
