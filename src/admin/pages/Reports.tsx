import { useState } from 'react'
import { useBookingReports, useOccupancyReport, usePopularRooms, useBookingTrends } from '../api/adminHooks'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { InlineLoader } from '../../components/ui/LoadingSpinner'

const COLORS = ['#C9A86A', '#2E5E4E', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#ec4899']

function formatCurrency(v: number) {
  return `₹${v.toLocaleString('en-IN')}`
}

export default function AdminReports() {
  const [period, setPeriod] = useState('monthly')
  const [reportMonth, setReportMonth] = useState(new Date().getMonth())
  const [reportYear, setReportYear] = useState(new Date().getFullYear())

  const { data: bookingReport, isLoading: loadingBookings } = useBookingReports({ period })
  const { data: occupancy, isLoading: loadingOcc } = useOccupancyReport({ month: reportMonth, year: reportYear })
  const { data: popular, isLoading: loadingPopular } = usePopularRooms()
  const { data: trends, isLoading: loadingTrends } = useBookingTrends({ months: 12 })

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl text-white">Reports</h1>
        <p className="text-white/40 text-sm mt-1">Booking analytics and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-display text-base">Booking Summary</h2>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
              <option value="daily" className="bg-[#0C0E12]">Daily</option>
              <option value="weekly" className="bg-[#0C0E12]">Weekly</option>
              <option value="monthly" className="bg-[#0C0E12]">Monthly</option>
            </select>
          </div>
          {loadingBookings ? <InlineLoader /> : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-white/40 text-xs">Total Bookings</p>
                <p className="text-white text-xl font-semibold">{(bookingReport as { totalBookings?: number })?.totalBookings || 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-white/40 text-xs">Total Revenue</p>
                <p className="text-[#C9A86A] text-xl font-semibold">{formatCurrency((bookingReport as { totalRevenue?: number })?.totalRevenue || 0)}</p>
              </div>
            </div>
          )}
          {(bookingReport as { dailyBookings?: { date: string; count: number; revenue: number }[] })?.dailyBookings && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(bookingReport as { dailyBookings: { date: string; count: number; revenue: number }[] }).dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" name="Bookings" fill="#C9A86A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {(bookingReport as { statusBreakdown?: { status: string; count: number }[] })?.statusBreakdown && (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={(bookingReport as { statusBreakdown: { status: string; count: number }[] }).statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60}                               label={({ status, percent }: { status?: string; percent?: number }) => `${status} (${((percent || 0) * 100).toFixed(0)}%)`}>
                  {(bookingReport as { statusBreakdown: { status: string; count: number }[] }).statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-display text-base">Occupancy Rate</h2>
            <div className="flex gap-2">
              <select value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))} className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A86A]/50">
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i} className="bg-[#0C0E12]">{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                ))}
              </select>
              <select value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))} className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#C9A86A]/50">
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y} className="bg-[#0C0E12]">{y}</option>
                ))}
              </select>
            </div>
          </div>
          {loadingOcc ? <InlineLoader /> : (
            <>
              <div className="text-center mb-4">
                <p className="text-4xl font-semibold text-white">{(occupancy as { overallOccupancy?: number })?.overallOccupancy?.toFixed(1) || '0'}%</p>
                <p className="text-white/40 text-xs">Overall Occupancy</p>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(occupancy as { roomStats?: { roomName: string; occupancyRate: number; bookedNights: number }[] })?.roomStats?.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs w-28 truncate">{r.roomName}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#C9A86A] transition-all" style={{ width: `${Math.min(r.occupancyRate, 100)}%` }} />
                    </div>
                    <span className="text-white/50 text-xs w-12 text-right">{r.occupancyRate.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-white font-display text-base mb-4">Booking Trends (12 Months)</h2>
          {loadingTrends ? <InlineLoader /> : (trends as { trends?: { month: string; bookings: number; revenue: number }[] })?.trends ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={(trends as { trends: { month: string; bookings: number; revenue: number }[] }).trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="bookings" stroke="#C9A86A" strokeWidth={2} dot={{ fill: '#C9A86A', r: 3 }} />
                <Line type="monotone" dataKey="revenue" stroke="#2E5E4E" strokeWidth={2} dot={{ fill: '#2E5E4E', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-white/30 text-sm">No trend data available</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-white font-display text-base mb-4">Popular Rooms</h2>
          {loadingPopular ? <InlineLoader /> : (popular as { popular?: { roomName: string; bookings: number; totalRevenue: number }[] })?.popular ? (
            <div className="space-y-3">
              {(popular as { popular: { roomName: string; bookings: number; totalRevenue: number }[] }).popular.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white/20 text-sm font-medium w-5">{i + 1}.</span>
                    <div>
                      <p className="text-white text-sm">{r.roomName}</p>
                      <p className="text-white/30 text-xs">{r.bookings} booking{r.bookings !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="text-[#C9A86A] text-sm font-medium">{formatCurrency(r.totalRevenue)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-white/30 text-sm">No data available</p>}
        </div>
      </div>
    </div>
  )
}
