import { useState } from 'react'

interface Experience {
  id: string
  title: string
  category: string
  duration: string
  price: number
  capacity: number
  booked: number
  status: 'active' | 'paused' | 'full'
  description: string
}

const initial: Experience[] = [
  { id: 'EXP-1', title: 'Morning Yoga by the River', category: 'Wellness', duration: '1 hr', price: 500, capacity: 15, booked: 8, status: 'active', description: 'Start your day with guided yoga beside the river.' },
  { id: 'EXP-2', title: 'Forest Trek to Serolsar Lake', category: 'Adventure', duration: '4 hrs', price: 1200, capacity: 10, booked: 10, status: 'full', description: 'A moderate trek through pine forests to a pristine lake.' },
  { id: 'EXP-3', title: 'Pottery Workshop', category: 'Culture', duration: '2 hrs', price: 800, capacity: 8, booked: 3, status: 'active', description: 'Learn traditional Himalayan pottery techniques.' },
  { id: 'EXP-4', title: 'Evening Bonfire with Stories', category: 'Entertainment', duration: '2 hrs', price: 300, capacity: 25, booked: 18, status: 'active', description: 'Gather around the fire for local folk tales and music.' },
  { id: 'EXP-5', title: 'Himalayan Cooking Class', category: 'Food', duration: '3 hrs', price: 1500, capacity: 6, booked: 6, status: 'full', description: 'Cook authentic Himachali dishes with a local chef.' },
  { id: 'EXP-6', title: 'Bird Watching Walk', category: 'Nature', duration: '2 hrs', price: 400, capacity: 12, booked: 4, status: 'active', description: 'Spot Himalayan bird species with an expert guide.' },
  { id: 'EXP-7', title: 'Star Gazing Session', category: 'Nature', duration: '1.5 hrs', price: 350, capacity: 20, booked: 7, status: 'paused', description: 'Observe the night sky through telescopes.' },
]

const categories = ['All', 'Wellness', 'Adventure', 'Culture', 'Entertainment', 'Food', 'Nature']

export default function ExperiencesManagement() {
  const [experiences, setExperiences] = useState<Experience[]>(initial)
  const [activeCategory, setActiveCategory] = useState('All')

  const toggleStatus = (id: string) => {
    setExperiences((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const next = e.status === 'active' ? 'paused' : e.status === 'paused' ? 'active' : 'active'
      return { ...e, status: next as Experience['status'] }
    }))
  }

  const filtered = activeCategory === 'All' ? experiences : experiences.filter((e) => e.category === activeCategory)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Experiences Management</h1>
        <p className="text-white/40 text-sm mt-1">Manage activities and guest experiences</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white bg-white/5'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exp) => (
          <div key={exp.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white text-sm font-medium">{exp.title}</h3>
                <span className="text-white/30 text-[10px] uppercase tracking-wider">{exp.category}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium border ${
                exp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                exp.status === 'full' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-white/5 text-white/40 border-white/10'
              }`}>
                {exp.status}
              </span>
            </div>
            <p className="text-white/50 text-xs mb-3 line-clamp-2">{exp.description}</p>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="text-white text-xs font-medium">{exp.duration}</p>
                <p className="text-white/30 text-[9px]">Duration</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="text-[#C9A86A] text-xs font-medium">₹{exp.price}</p>
                <p className="text-white/30 text-[9px]">Per person</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-2">
                <p className="text-white text-xs font-medium">{exp.booked}/{exp.capacity}</p>
                <p className="text-white/30 text-[9px]">Booked</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#2E5E4E] transition-all" style={{ width: `${(exp.booked / exp.capacity) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
              <button onClick={() => toggleStatus(exp.id)} className="text-xs text-white/50 hover:text-white transition-colors">
                {exp.status === 'paused' ? 'Activate' : 'Pause'}
              </button>
              <button className="text-xs text-[#C9A86A] hover:text-[#d4b87a]">Edit Experience</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
