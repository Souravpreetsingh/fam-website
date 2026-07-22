import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboardData } from '../api/userDashboardHooks'
import StatsCard from '../components/StatsCard'
import EmptyState from '../components/EmptyState'
import AIConcierge from '../components/AIConcierge'
import WeatherWidget from '../components/WeatherWidget'
import Rewards from '../components/Rewards'
import Recommendations from '../components/Recommendations'
import Wishlist from '../components/Wishlist'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Booking } from '../../types'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const statIcons = {
  total: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  upcoming: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  spent: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  points: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

const quickActions = [
  { label: 'Book a Room', to: '/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'View My Bookings', to: '/dashboard/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Update Profile', to: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Contact Support', to: '/', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

function statusChip(status: string) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    no_show: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    checked_in: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    checked_out: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${map[status] || 'bg-white/5 text-white/50 border-white/10'}`}>
      {status}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRoomName(b: Booking) {
  if (typeof b.room === 'object' && b.room !== null) {
    return (b.room as { name?: string }).name || 'Room'
  }
  return `Room #${b.room}`
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      to={`/dashboard/booking/${booking._id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium text-sm">{getRoomName(booking)}</p>
          <p className="text-white/40 text-xs mt-0.5">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
        </div>
        {statusChip(booking.status)}
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
        <span className="text-[#C9A86A] font-medium">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </Link>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const { data, isLoading } = useDashboardData()
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.from(headerRef.current.querySelectorAll('.anim-up'), {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8" ref={headerRef}>
      <div className="anim-up">
        <h1 className="text-2xl md:text-3xl font-display text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'Guest'}
        </h1>
        <p className="text-white/40 text-sm mt-1">Here's your stay overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Total Bookings" value={data?.stats.totalBookings || 0} icon={statIcons.total} />
          <StatsCard label="Upcoming Stays" value={data?.stats.upcomingStays || 0} icon={statIcons.upcoming} />
          <StatsCard label="Total Spent" value={`₹${(data?.stats.totalSpent || 0).toLocaleString('en-IN')}`} icon={statIcons.spent} />
          <StatsCard label="Loyalty Points" value={data?.stats.loyaltyPoints || 0} icon={statIcons.points} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-white font-display text-lg mb-4">Upcoming Stay</h2>
          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : data?.upcomingBooking ? (
            <BookingCard booking={data.upcomingBooking} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-white/40 text-sm mb-4">No upcoming stays</p>
              <Link to="/rooms" className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
                Browse Rooms
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-white font-display text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-all text-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A86A]">
                  <path d={action.icon} />
                </svg>
                <span className="text-white/70 text-xs">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIConcierge />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <Rewards points={data?.stats.loyaltyPoints || 850} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Wishlist />
        <Recommendations />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-display text-lg">Recent Bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm text-[#C9A86A] hover:text-[#d4b87a] transition-colors">
            View All
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : data?.recentBookings && data.recentBookings.length > 0 ? (
          <div className="space-y-3">
            {data.recentBookings.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            title="No bookings yet"
            description="Your booking history will appear here once you make your first reservation."
            actionLabel="Book a Room"
            actionTo="/rooms"
          />
        )}
      </div>
    </div>
  )
}
