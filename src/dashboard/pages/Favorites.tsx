import { Link } from 'react-router-dom'
import { useFavorites, toggleFavorite } from '../api/userDashboardHooks'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { Room } from '../../types'

function FavoriteCard({ room }: { room: Room }) {
  const qc = useQueryClient()

  const handleRemove = () => {
    toggleFavorite(room._id)
    qc.invalidateQueries({ queryKey: ['dashboard', 'favorites'] })
    toast.success('Removed from favorites')
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:bg-white/[0.06] transition-all">
      <Link to={`/rooms/${room.slug}`}>
        <div className="h-44 bg-white/5 overflow-hidden">
          {room.images && room.images.length > 0 ? (
            <img src={room.images[0].url} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/rooms/${room.slug}`}>
          <h3 className="text-white font-medium text-sm mb-1 hover:text-[#C9A86A] transition-colors">{room.name}</h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
          <span>{room.capacity.maxGuests} Guests</span>
          <span>&middot;</span>
          <span>{room.bedType}</span>
          <span>&middot;</span>
          <span>{room.size} m&sup2;</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#C9A86A] font-semibold text-sm">₹{room.pricePerNight.toLocaleString('en-IN')}</span>
            <span className="text-white/30 text-xs"> / night</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/rooms/${room.slug}/book`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
              Book Now
            </Link>
            <button onClick={handleRemove} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Favorites() {
  const { data, isLoading } = useFavorites()
  const rooms = data?.results || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">My Favorites</h1>
        <p className="text-white/40 text-sm mt-1">Your saved rooms for quick booking</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          title="No favorites yet"
          description="Save rooms you love to quickly find and book them later."
          actionLabel="Browse Rooms"
          actionTo="/rooms"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map(room => (
            <FavoriteCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
