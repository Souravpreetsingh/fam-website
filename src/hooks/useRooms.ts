import { useQuery } from '@tanstack/react-query'
import { roomsApi, type RoomFilters } from '../api/rooms'

export const roomKeys = {
  all: ['rooms'] as const,
  list: (filters?: RoomFilters) => ['rooms', 'list', filters] as const,
  details: () => ['rooms', 'detail'] as const,
  detail: (id: string) => ['rooms', 'detail', id] as const,
  slug: (slug: string) => ['rooms', 'slug', slug] as const,
  featured: () => ['rooms', 'featured'] as const,
  availability: (params: { checkIn: string; checkOut: string; roomId?: string }) =>
    ['rooms', 'availability', params] as const,
}

export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: roomKeys.list(filters),
    queryFn: async () => {
      const { data } = await roomsApi.getAll(filters)
      return data.data!
    },
  })
}

export function useFeaturedRooms() {
  return useQuery({
    queryKey: roomKeys.featured(),
    queryFn: async () => {
      const { data } = await roomsApi.getFeatured()
      return data.data!
    },
  })
}

export function useRoomBySlug(slug: string) {
  return useQuery({
    queryKey: roomKeys.slug(slug),
    queryFn: async () => {
      const { data } = await roomsApi.getBySlug(slug)
      return data.data!
    },
    enabled: !!slug,
  })
}

export function useRoomById(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      const { data } = await roomsApi.getById(id)
      return data.data!
    },
    enabled: !!id,
  })
}

export function useRoomAvailability(params: { checkIn: string; checkOut: string; roomId?: string }) {
  return useQuery({
    queryKey: roomKeys.availability(params),
    queryFn: async () => {
      const { data } = await roomsApi.checkAvailability(params)
      return data.data!
    },
    enabled: !!params.checkIn && !!params.checkOut,
  })
}
