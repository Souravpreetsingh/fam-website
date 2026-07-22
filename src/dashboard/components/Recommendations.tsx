import { Link } from 'react-router-dom'

const recommendations = [
  { id: '1', title: 'Sunset Point', type: 'Experience', image: '🌅', desc: '15 min walk from property' },
  { id: '2', title: 'Jibhi Waterfall', type: 'Trek', image: '🏞️', desc: 'Popular morning trek' },
  { id: '3', title: 'Café Breakfast', type: 'Dining', image: '☕', desc: 'Try the Himalayan pancakes' },
  { id: '4', title: 'Forest Trek', type: 'Adventure', image: '🌲', desc: 'Guided 3-hr forest walk' },
]

export default function Recommendations() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-display text-sm">Recommended For You</h3>
        <span className="material-symbols-outlined text-white/30 text-[18px]">auto_awesome</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {recommendations.map((r) => (
          <Link
            key={r.id}
            to="/dashboard"
            className="rounded-xl bg-white/[0.04] border border-white/5 p-3 hover:bg-white/[0.08] transition-all"
          >
            <span className="text-xl mb-1 block">{r.image}</span>
            <p className="text-white text-xs font-medium">{r.title}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{r.type}</p>
            <p className="text-white/20 text-[9px] mt-0.5">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
