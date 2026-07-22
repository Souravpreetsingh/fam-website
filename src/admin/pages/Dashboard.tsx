import { useAdminDashboard } from '../api/adminHooks'
import StatsCard from '../components/StatsCard'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COLORS = ['#2E5E4E', '#C9A86A', '#ef4444', '#3b82f6', '#8b5cf6']

const statCards = [
  { label: 'Total Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', key: 'totalRevenue', prefix: '₹' },
  { label: 'Total Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', key: 'totalBookings' },
  { label: 'Total Rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', key: 'totalRooms' },
  { label: 'Registered Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', key: 'totalUsers' },
  { label: 'Pending Bookings', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', key: 'pendingBookings', highlight: true },
  { label: 'Confirmed Bookings', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', key: 'confirmedBookings' },
  { label: 'Pending Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', key: 'pendingReviews', highlight: true },
  { label: 'Unread Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', key: 'unreadContacts', highlight: true },
]

export default function Dashboard() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) return <InlineLoader />

  if (error || !data) {
    return <div className="text-center py-16 text-red-400">Failed to load dashboard data.</div>
  }

  const { stats, recentBookings, revenueByMonth, bookingStats } = data

  const revenueChartData = revenueByMonth.map((r) => ({
    name: MONTHS[r._id.month - 1] || `${r._id.month}`,
    revenue: r.revenue,
    bookings: r.count || r.bookings,
  }))

  const pieData = bookingStats.map((b) => ({ name: b._id.charAt(0).toUpperCase() + b._id.slice(1), value: b.count }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Overview of your property</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => {
          const value = stats[card.key as keyof typeof stats] ?? 0
          return (
            <StatsCard
              key={card.key}
              label={card.label}
              value={card.prefix ? `${card.prefix}${(value as number).toLocaleString('en-IN')}` : value}
              icon={card.icon}
            />
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-lg mb-4">Monthly Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#2E5E4E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-lg mb-4">Booking Status</h2>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/30 text-sm">No booking data</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-white/50 text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-display text-lg">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-xs text-[#C9A86A] hover:text-[#d4b87a] transition-colors">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Guest</th>
                <th className="text-left px-5 py-3 font-medium">Room</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/30">No recent bookings</td></tr>
              ) : recentBookings.map((b) => (
                <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white">{(b.user as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-5 py-3 text-white/70">{(b.room as { name?: string })?.name || 'N/A'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      b.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                      b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      b.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/70">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-white/50">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
