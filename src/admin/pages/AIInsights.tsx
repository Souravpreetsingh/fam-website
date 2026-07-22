import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const sentimentData = [
  { month: 'Jan', positive: 85, neutral: 10, negative: 5 },
  { month: 'Feb', positive: 82, neutral: 13, negative: 5 },
  { month: 'Mar', positive: 88, neutral: 8, negative: 4 },
  { month: 'Apr', positive: 79, neutral: 15, negative: 6 },
  { month: 'May', positive: 91, neutral: 6, negative: 3 },
  { month: 'Jun', positive: 87, neutral: 9, negative: 4 },
]

const occupancyForecast = [
  { month: 'Jul', forecast: 82, lastYear: 74 },
  { month: 'Aug', forecast: 88, lastYear: 79 },
  { month: 'Sep', forecast: 76, lastYear: 71 },
  { month: 'Oct', forecast: 68, lastYear: 62 },
  { month: 'Nov', forecast: 55, lastYear: 48 },
  { month: 'Dec', forecast: 72, lastYear: 65 },
]

const popularTags = [
  { name: 'Peaceful', count: 142, color: '#2E5E4E' },
  { name: 'Scenic Views', count: 128, color: '#C9A86A' },
  { name: 'Great Food', count: 96, color: '#3b82f6' },
  { name: 'Friendly Staff', count: 88, color: '#8b5cf6' },
  { name: 'Clean Rooms', count: 74, color: '#ef4444' },
  { name: 'Value for Money', count: 62, color: '#10b981' },
]

const recommendations = [
  { insight: 'Weekend occupancy dips 15% — offer 2-night weekend packages', impact: 'high', metric: '+₹2.4L/month' },
  { insight: 'Riverfront rooms have 40% higher satisfaction — prioritize maintenance', impact: 'medium', metric: '+8% rating' },
  { insight: 'Bonfire experience sells out 3 days in advance — add evening sessions', impact: 'high', metric: '+₹80K/month' },
  { insight: 'Repeat guests prefer Pine View Suite — offer loyalty upgrade', impact: 'medium', metric: '+12% retention' },
  { insight: 'Café revenue peaks at 8-10 AM — extend breakfast hours', impact: 'low', metric: '+₹35K/month' },
]

const COLORS = ['#2E5E4E', '#C9A86A', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981']

export default function AIInsights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">AI Insights</h1>
        <p className="text-white/40 text-sm mt-1">Data-driven recommendations for your property</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-sm mb-4">Guest Sentiment Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="positive" stroke="#2E5E4E" strokeWidth={2} dot={{ r: 3, fill: '#2E5E4E' }} />
                <Line type="monotone" dataKey="neutral" stroke="#C9A86A" strokeWidth={2} dot={{ r: 3, fill: '#C9A86A' }} />
                <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-sm mb-4">Occupancy Forecast</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0C0E12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="forecast" fill="#2E5E4E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-2 text-white/40 text-xs"><span className="w-3 h-3 rounded-sm bg-[#2E5E4E]" /> Forecast</span>
            <span className="flex items-center gap-2 text-white/40 text-xs"><span className="w-3 h-3 rounded-sm bg-white/10" /> Last Year</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-sm mb-4">Most Mentioned Topics</h2>
          <div className="space-y-3">
            {popularTags.map((tag) => (
              <div key={tag.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
                <span className="text-white/70 text-xs flex-1">{tag.name}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full rounded-full" style={{ width: `${(tag.count / 142) * 100}%`, background: tag.color }} />
                </div>
                <span className="text-white/40 text-[10px] w-8 text-right">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-white font-display text-sm mb-4">AI Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white/80 text-xs leading-relaxed">{rec.insight}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                    rec.impact === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                    rec.impact === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-white/5 text-white/40'
                  }`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-[#C9A86A] text-[10px] mt-1 font-medium">{rec.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
