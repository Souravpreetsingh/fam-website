import { useLocation, Link } from 'react-router-dom'

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  bookings: 'My Bookings',
  booking: 'Booking Details',
  payments: 'Payments',
  reviews: 'My Reviews',
  favorites: 'Favorites',
  profile: 'Profile',
  notifications: 'Notifications',
  settings: 'Settings',
  security: 'Security',
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-xs text-white/30">
      <Link to="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
      {segments.slice(1).map((seg, i) => {
        const path = '/' + segments.slice(0, i + 2).join('/')
        const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
        const isLast = i === segments.slice(1).length - 1
        return (
          <span key={path} className="flex items-center gap-2">
            <span className="text-white/10">/</span>
            {isLast ? (
              <span className="text-white/50">{label}</span>
            ) : (
              <Link to={path} className="hover:text-white/60 transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
