import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userDashboardApi } from './userDashboardApi'
import type { Booking } from '../../types'
import type { DashboardNotification, DashboardStats } from '../types/dashboard'

export const dashboardKeys = {
  bookings: (params?: Record<string, unknown>) => ['dashboard', 'bookings', params] as const,
  booking: (id: string) => ['dashboard', 'booking', id] as const,
  profile: ['dashboard', 'profile'] as const,
  rooms: (params?: Record<string, unknown>) => ['dashboard', 'rooms', params] as const,
  room: (id: string) => ['dashboard', 'room', id] as const,
}

function getDashboardStats(bookings: Booking[]): DashboardStats {
  const totalBookings = bookings.length
  const completedStays = bookings.filter(b => b.status === 'completed').length
  const upcomingStays = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length
  const totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
  return {
    totalBookings,
    completedStays,
    upcomingStays,
    cancelledBookings,
    totalSpent,
    loyaltyPoints: Math.floor(totalSpent / 100),
    memberSince: '',
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.bookings(),
    queryFn: async () => {
      const { data: bookingsRes } = await userDashboardApi.getMyBookings({ limit: 50 })
      const allBookings = bookingsRes.data!.results
      const now = new Date()
      const upcoming = allBookings.find(b => b.status === 'confirmed' && new Date(b.checkIn) > now) || null
      const stats = getDashboardStats(allBookings)
      return {
        stats,
        upcomingBooking: upcoming,
        recentBookings: allBookings.slice(0, 5),
      }
    },
  })
}

export function useMyBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: dashboardKeys.bookings(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await userDashboardApi.getMyBookings(params)
      return data.data!
    },
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: dashboardKeys.booking(id),
    queryFn: async () => {
      const { data } = await userDashboardApi.getBookingById(id)
      return data.data!
    },
    enabled: !!id,
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => userDashboardApi.cancelBooking(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Booking cancelled')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed to cancel'),
  })
}

export function useUpdateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { checkIn?: string; checkOut?: string; guests?: { adults: number; children?: number }; specialRequests?: string } }) =>
      userDashboardApi.updateBooking(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Booking updated')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed to update'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; phone?: string }) => userDashboardApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dashboardKeys.profile })
      toast.success('Profile updated')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed to update'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => userDashboardApi.changePassword(data),
    onSuccess: () => toast.success('Password changed'),
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed to change password'),
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: dashboardKeys.profile,
    queryFn: async () => {
      const { data } = await userDashboardApi.getProfile()
      return data.data!
    },
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { room: string; booking?: string; rating: number; title?: string; comment: string }) =>
      userDashboardApi.createReview(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review submitted for approval')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating?: number; title?: string; comment?: string } }) =>
      userDashboardApi.updateReview(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review updated')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userDashboardApi.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review deleted')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useRooms(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: dashboardKeys.rooms(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await userDashboardApi.getRooms(params)
      return data.data!
    },
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: dashboardKeys.room(id),
    queryFn: async () => {
      const { data } = await userDashboardApi.getRoomById(id)
      return data.data!
    },
    enabled: !!id,
  })
}

const NOTIFICATIONS_KEY = 'fam_dashboard_notifications'

export function getStoredNotifications(): DashboardNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveNotifications(n: DashboardNotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(n))
}

export function addNotification(n: Omit<DashboardNotification, 'id' | 'createdAt' | 'isRead'>) {
  const list = getStoredNotifications()
  const newN: DashboardNotification = { ...n, id: crypto.randomUUID(), isRead: false, createdAt: new Date().toISOString() }
  list.unshift(newN)
  saveNotifications(list)
  return newN
}

export function useNotifications() {
  return useQuery({
    queryKey: ['dashboard', 'notifications'],
    queryFn: () => getStoredNotifications(),
  })
}

const FAVORITES_KEY = 'fam_dashboard_favorites'

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const ids = getFavorites()
  return useQuery({
    queryKey: ['dashboard', 'favorites', ids],
    queryFn: async () => {
      if (!ids.length) return { results: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } }
      const promises = ids.map(id => userDashboardApi.getRoomById(id).then(r => r.data.data!).catch(() => null))
      const rooms = (await Promise.all(promises)).filter(Boolean) as import('../../types').Room[]
      return { results: rooms, pagination: { page: 1, limit: 20, total: rooms.length, totalPages: 1, hasNextPage: false, hasPrevPage: false } }
    },
  })
}

export function toggleFavorite(roomId: string) {
  const ids = getFavorites()
  const idx = ids.indexOf(roomId)
  if (idx >= 0) ids.splice(idx, 1)
  else ids.push(roomId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

export function isFavorite(roomId: string): boolean {
  return getFavorites().includes(roomId)
}
