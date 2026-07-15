export interface StatsCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down'
  icon: string
  loading?: boolean
}

export default function StatsCard({ label, value, subtitle, icon, loading }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A86A]">
            <path d={icon} />
          </svg>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 w-16 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-semibold text-white">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
          <p className="text-white/40 text-sm mt-0.5">{label}</p>
          {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  )
}
