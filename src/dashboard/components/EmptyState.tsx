import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

export default function EmptyState({ icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
          <path d={icon} />
        </svg>
      </div>
      <h3 className="text-white/70 font-display text-lg mb-1">{title}</h3>
      <p className="text-white/30 text-sm text-center max-w-xs mb-6">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
