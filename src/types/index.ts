export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: { field: string; message: string }[]
}

export interface PaginatedData<T> {
  results: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'guest' | 'admin'
  isVerified: boolean
  avatar?: { public_id: string; url: string }
  bookings: string[]
  createdAt: string
  updatedAt: string
}

export interface Room {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  pricePerNight: number
  discountPrice: number | null
  currency: string
  capacity: { adults: number; children: number; maxGuests: number }
  size: number
  bedType: string
  amenities: string[]
  images: { public_id: string; url: string; alt: string }[]
  thumbnail: { public_id: string; url: string }
  isAvailable: boolean
  isFeatured: boolean
  totalRooms: number
  status?: 'available' | 'booked' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_service'
  maintenanceBlocks?: { _id: string; startDate: string; endDate: string; reason: string }[]
  minStay?: number
  maxStay?: number
  rating: number
  numReviews: number
  cancellationPolicy: string
  checkInTime: string
  checkOutTime: string
}

export interface Booking {
  _id: string
  user: string | User
  room: string | Room
  checkIn: string
  checkOut: string
  guests: { adults: number; children: number }
  totalAmount: number
  amountPaid: number
  currency: string
  status: 'draft' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'no_show' | 'expired'
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
  specialRequests: string
  nights: number
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  user: { _id: string; name: string; avatar?: { url: string } }
  room: string
  booking?: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  isApproved: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaymentOrder {
  orderId: string
  amount: number
  currency: string
  keyId: string
}
