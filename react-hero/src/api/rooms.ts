import type { ApiResponse, PaginatedData, Room } from '../types'
import { api } from './axios'

export interface RoomFilters {
  page?: number
  limit?: number
  isAvailable?: boolean
  isFeatured?: boolean
  minPrice?: number
  maxPrice?: number
  capacity?: number
  search?: string
  sort?: string
  amenities?: string
  bedType?: string
  checkIn?: string
  checkOut?: string
  status?: string
}

export interface AvailabilityResponse {
  availability: {
    room: {
      _id: string
      name: string
      slug: string
      pricePerNight: number
      discountPrice: number | null
      capacity: { adults: number; children: number; maxGuests: number }
      thumbnail: { url: string } | null
      amenities: string[]
      bedType: string
      status: string
      minStay: number
      maxStay: number
    }
    available: boolean
    nights: number
    totalPrice: number
    reason: string | null
  }[]
  checkIn: string
  checkOut: string
}

export const roomsApi = {
  getAll: (filters?: RoomFilters) =>
    api.get<ApiResponse<PaginatedData<Room>>>('/rooms', { params: filters }),

  getFeatured: () =>
    api.get<ApiResponse<Room[]>>('/rooms/featured'),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Room>>(`/rooms/slug/${slug}`),

  getById: (id: string) =>
    api.get<ApiResponse<Room>>(`/rooms/${id}`),

  checkAvailability: (params: { checkIn: string; checkOut: string; roomId?: string }) =>
    api.get<ApiResponse<AvailabilityResponse>>('/rooms/availability', { params }),
}
