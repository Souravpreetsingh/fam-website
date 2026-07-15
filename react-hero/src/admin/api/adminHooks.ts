import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './adminApi'
import toast from 'react-hot-toast'

export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  revenue: (params?: { from?: string; to?: string }) => ['admin', 'revenue', params] as const,
  users: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
  user: (id: string) => ['admin', 'users', id] as const,
  bookings: (params?: Record<string, unknown>) => ['admin', 'bookings', params] as const,
  rooms: (params?: Record<string, unknown>) => ['admin', 'rooms', params] as const,
  reviews: (params?: Record<string, unknown>) => ['admin', 'reviews', params] as const,
  contacts: (params?: Record<string, unknown>) => ['admin', 'contacts', params] as const,
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: async () => {
      const { data } = await adminApi.dashboard()
      return data.data!
    },
  })
}

export function useAdminRevenue(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: adminKeys.revenue(params),
    queryFn: async () => {
      const { data } = await adminApi.revenue(params)
      return data.data!
    },
  })
}

export function useAdminUsers(params?: { page?: number; limit?: number; role?: string; isVerified?: string; search?: string }) {
  return useQuery({
    queryKey: adminKeys.users(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.users(params)
      return data.data!
    },
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: async () => {
      const { data } = await adminApi.userDetails(id)
      return data.data!
    },
    enabled: !!id,
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'guest' | 'admin' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User role updated') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User deleted') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useAdminBookings(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: adminKeys.bookings(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.bookings(params)
      return data.data!
    },
  })
}

export function useAdminRooms(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: adminKeys.rooms(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.rooms(params)
      return data.data!
    },
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (roomData: Partial<import('../../types').Room>) => {
      const { data } = await adminApi.createRoom(roomData)
      return data.data!
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Room created') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<import('../../types').Room> }) => {
      const { data: res } = await adminApi.updateRoom(id, data)
      return res.data!
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Room updated') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteRoom(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Room deleted') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useUploadRoomImages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => adminApi.uploadRoomImages(id, files),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Images uploaded') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useDeleteRoomImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, imageId }: { roomId: string; imageId: string }) => adminApi.deleteRoomImage(roomId, imageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Image deleted') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useAdminReviews(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: adminKeys.reviews(params),
    queryFn: async () => {
      const { data } = await adminApi.reviews(params as { page?: number; limit?: number; isApproved?: string; roomId?: string; rating?: number })
      return data.data!
    },
  })
}

export function useApproveReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.approveReview(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.reviews() }); toast.success('Review status updated') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.reviews() }); toast.success('Review deleted') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useAdminContacts(params?: { page?: number; limit?: number; isRead?: string }) {
  return useQuery({
    queryKey: adminKeys.contacts(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.contacts(params)
      return data.data!
    },
  })
}

export function useMarkContactRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.markContactRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.contacts() }); toast.success('Marked as read') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export const adminReportKeys = {
  bookings: (params?: Record<string, unknown>) => ['admin', 'reports', 'bookings', params] as const,
  occupancy: (params?: Record<string, unknown>) => ['admin', 'reports', 'occupancy', params] as const,
  popular: (params?: Record<string, unknown>) => ['admin', 'reports', 'popular', params] as const,
  trends: (params?: Record<string, unknown>) => ['admin', 'reports', 'trends', params] as const,
  calendar: (params?: Record<string, unknown>) => ['admin', 'calendar', params] as const,
}

export function useConfirmBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.confirmBooking(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.bookings() }); qc.invalidateQueries({ queryKey: adminKeys.dashboard }); toast.success('Booking confirmed') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useCheckInBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.checkInBooking(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.bookings() }); qc.invalidateQueries({ queryKey: adminKeys.dashboard }); toast.success('Guest checked in') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useCheckOutBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.checkOutBooking(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.bookings() }); qc.invalidateQueries({ queryKey: adminKeys.dashboard }); toast.success('Guest checked out') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useMarkNoShow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.markNoShow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.bookings() }); qc.invalidateQueries({ queryKey: adminKeys.dashboard }); toast.success('Marked as no-show') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useMoveBookingRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newRoomId }: { id: string; newRoomId: string }) => adminApi.moveBookingRoom(id, newRoomId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.bookings() }); toast.success('Booking moved to new room') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useUpdateRoomStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateRoomStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Room status updated') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useBlockForMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { startDate: string; endDate: string; reason?: string } }) => adminApi.blockForMaintenance(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Room blocked for maintenance') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useRemoveMaintenanceBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, blockId }: { roomId: string; blockId: string }) => adminApi.removeMaintenanceBlock(roomId, blockId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rooms() }); toast.success('Maintenance block removed') },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message || 'Failed'),
  })
}

export function useBookingReports(params?: { period?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: adminReportKeys.bookings(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.bookingReports(params)
      return data.data!
    },
  })
}

export function useOccupancyReport(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: adminReportKeys.occupancy(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.occupancyReport(params)
      return data.data!
    },
  })
}

export function usePopularRooms(params?: { limit?: number }) {
  return useQuery({
    queryKey: adminReportKeys.popular(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.popularRooms(params)
      return data.data!
    },
  })
}

export function useBookingTrends(params?: { months?: number }) {
  return useQuery({
    queryKey: adminReportKeys.trends(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.bookingTrends(params)
      return data.data!
    },
  })
}

export function useBookingCalendar(params?: { month?: number; year?: number; roomId?: string }) {
  return useQuery({
    queryKey: adminReportKeys.calendar(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await adminApi.bookingCalendar(params)
      return data.data!
    },
  })
}

export function useAdminNotifications(params?: { page?: number; limit?: number; isRead?: string }) {
  return useQuery({
    queryKey: ['admin', 'notifications', params] as const,
    queryFn: async () => {
      const { data } = await adminApi.notifications(params)
      return data.data! as { notifications: import('../../api/notifications').NotificationItem[]; unreadCount: number; pagination: import('../../types').PaginationMeta }
    },
  })
}
