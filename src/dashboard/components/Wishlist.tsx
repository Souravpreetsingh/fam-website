import { Link } from 'react-router-dom'

const savedRooms = [
  { id: '1', name: 'Pine View Suite', price: 8500, image: '🏡' },
  { id: '2', name: 'Riverfront Cottage', price: 12000, image: '🏠' },
  { id: '3', name: 'Mountain Lodge', price: 6500, image: '🏔️' },
]

export default function Wishlist() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-display text-sm">Saved Trips</h3>
        <Link to="/dashboard/favorites" className="text-[10px] text-[#C9A86A] hover:text-[#d4b87a]">View all</Link>
      </div>
      <div className="space-y-2">
        {savedRooms.map((room) => (
          <div key={room.id} className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/5 p-3">
            <span className="text-xl">{room.image}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{room.name}</p>
              <p className="text-[#C9A86A] text-xs">₹{room.price.toLocaleString('en-IN')}<span className="text-white/30 text-[10px]">/night</span></p>
            </div>
            <button className="text-white/20 hover:text-red-400 transition-colors">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
