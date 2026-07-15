import { useParams, Link } from 'react-router-dom'
import { useRoomBySlug } from '../hooks/useRooms'
import { useRoomReviews } from '../hooks/useReviews'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { useState } from 'react'

export default function RoomDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: room, isLoading, error } = useRoomBySlug(slug || '')
  const { data: reviewsData } = useRoomReviews(room?._id || '')
  const [selectedImage, setSelectedImage] = useState(0)

  if (isLoading) return <PageLoader />

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Room not found.</p>
          <Link to="/rooms" className="text-[#C9A86A] hover:text-[#d4b87a]">Back to rooms</Link>
        </div>
      </div>
    )
  }

  const reviews = reviewsData?.results || []
  const images = room.images?.length ? room.images : [room.thumbnail].filter(Boolean)

  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-16">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Rooms
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3">
              <img
                src={images[selectedImage]?.url}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-[#C9A86A]' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-4xl text-white mb-2">{room.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.round(room.rating) ? 'text-[#C9A86A]' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white/40 text-sm ml-1">({room.numReviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-semibold text-[#C9A86A]">
                ₹{room.discountPrice || room.pricePerNight}
              </span>
              <span className="text-white/30 text-sm">/ night</span>
              {room.discountPrice && (
                <span className="text-white/30 text-sm line-through">₹{room.pricePerNight}</span>
              )}
            </div>

            <p className="text-white/60 leading-relaxed mb-6">{room.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Max Guests', value: room.capacity.maxGuests },
                { label: 'Bed', value: room.bedType },
                { label: 'Size', value: `${room.size} sq ft` },
                { label: 'Check-in', value: room.checkInTime },
                { label: 'Check-out', value: room.checkOutTime },
                { label: 'Rooms Available', value: room.totalRooms },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {room.amenities?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white/70 text-sm font-medium mb-3 uppercase tracking-wider">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span key={amenity} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/rooms/${room.slug}/book`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2E5E4E] text-white font-medium text-sm hover:bg-[#3a705e] transition-all"
            >
              Book This Room
            </Link>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="border-t border-white/10 pt-12">
            <h2 className="font-display text-2xl text-white mb-6">Guest Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm text-white/60">
                      {review.user?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{review.user?.name || 'Guest'}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-[#C9A86A]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="text-white text-sm font-medium mb-1">{review.title}</p>}
                  <p className="text-white/50 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
