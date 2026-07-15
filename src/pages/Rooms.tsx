import { Link } from 'react-router-dom'
import { useRooms } from '../hooks/useRooms'
import { InlineLoader } from '../components/ui/LoadingSpinner'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-[#C9A86A]' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-white/40 text-xs ml-1">({rating.toFixed(1)})</span>
    </div>
  )
}

export default function Rooms() {
  const { data, isLoading, error } = useRooms({ isAvailable: true })

  if (isLoading) return <InlineLoader />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load rooms. Please try again.</p>
        </div>
      </div>
    )
  }

  const rooms = data?.results || []

  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Our Rooms</h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            Each room at FAM is thoughtfully designed to offer comfort, luxury, and breathtaking views of the Himalayas.
          </p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-white/40">No rooms available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room._id}
                to={`/rooms/${room.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={room.thumbnail?.url || '/placeholder-room.jpg'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl text-white group-hover:text-[#C9A86A] transition-colors">
                      {room.name}
                    </h3>
                    <div className="text-right">
                      <p className="text-[#C9A86A] font-semibold text-lg">
                        ₹{room.discountPrice || room.pricePerNight}
                      </p>
                      <p className="text-white/30 text-xs">per night</p>
                    </div>
                  </div>
                  <StarRating rating={room.rating} />
                  <p className="text-white/50 text-sm mt-3 line-clamp-2">
                    {room.shortDescription || room.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                    <span>Up to {room.capacity.maxGuests} guests</span>
                    <span>·</span>
                    <span>{room.size} sq ft</span>
                    <span>·</span>
                    <span>{room.bedType}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
