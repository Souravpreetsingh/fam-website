import { api } from '../../api/axios'
import type { ApiResponse, PaginatedData, Room, Booking, Review } from '../../types'
import type { DashboardData, RevenueAnalytics, AdminUser, AdminContact } from '../types/admin'

interface AdminUsersResponse {
  users: AdminUser[]
  pagination: PaginatedData<unknown>['pagination']
}

interface AdminBookingsResponse {
  bookings: Booking[]
  pagination: PaginatedData<unknown>['pagination']
}

interface AdminReviewsResponse {
  reviews: Review[]
  pagination: PaginatedData<unknown>['pagination']
}

interface AdminContactsResponse {
  contacts: AdminContact[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const adminApi = {
  dashboard: () =>
    api.get<ApiResponse<DashboardData>>('/admin/dashboard'),

  users: (params?: { page?: number; limit?: number; role?: string; isVerified?: string; search?: string }) =>
    api.get<ApiResponse<AdminUsersResponse>>('/admin/users', { params }),

  userDetails: (id: string) =>
    api.get<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}`),

  updateUserRole: (id: string, role: 'guest' | 'admin') =>
    api.put<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}/role`, { role }),

  deleteUser: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/users/${id}`),

  bookings: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<AdminBookingsResponse>>('/admin/bookings', { params }),

  revenue: (params?: { from?: string; to?: string }) =>
    api.get<ApiResponse<RevenueAnalytics>>('/admin/revenue', { params }),

  reviews: (params?: { page?: number; limit?: number; isApproved?: string; roomId?: string; rating?: number }) =>
    api.get<ApiResponse<AdminReviewsResponse>>('/admin/reviews', { params }),

  approveReview: (id: string) =>
    api.put<ApiResponse<{ review: Review }>>(`/admin/reviews/${id}/approve`),

  deleteReview: (id: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}`),

  createRoom: (data: Partial<Room>) =>
    api.post<ApiResponse<{ room: Room }>>('/rooms', data),

  updateRoom: (id: string, data: Partial<Room>) =>
    api.put<ApiResponse<{ room: Room }>>(`/rooms/${id}`, data),

  deleteRoom: (id: string) =>
    api.delete<ApiResponse<null>>(`/rooms/${id}`),

  uploadRoomImages: (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('images', f))
    return api.post<ApiResponse<{ room: Room }>>(`/rooms/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteRoomImage: (roomId: string, imageId: string) =>
    api.delete<ApiResponse<{ room: Room }>>(`/rooms/${roomId}/images/${imageId}`),

  contacts: (params?: { page?: number; limit?: number; isRead?: string }) =>
    api.get<ApiResponse<AdminContactsResponse>>('/contact/admin', { params }),

  markContactRead: (id: string) =>
    api.put<ApiResponse<{ contact: AdminContact }>>(`/contact/admin/${id}/read`),

  rooms: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<{ rooms: Room[]; pagination: PaginatedData<unknown>['pagination'] }>>('/rooms', { params }),

  confirmBooking: (id: string) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/confirm`),

  checkInBooking: (id: string) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/check-in`),

  checkOutBooking: (id: string) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/check-out`),

  markNoShow: (id: string) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/no-show`),

  moveBookingRoom: (id: string, newRoomId: string) =>
    api.put<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/move-room`, { newRoomId }),

  updateRoomStatus: (id: string, status: string) =>
    api.put<ApiResponse<{ room: Room }>>(`/admin/rooms/${id}/status`, { status }),

  blockForMaintenance: (id: string, data: { startDate: string; endDate: string; reason?: string }) =>
    api.post<ApiResponse<{ room: Room }>>(`/admin/rooms/${id}/maintenance`, data),

  removeMaintenanceBlock: (roomId: string, blockId: string) =>
    api.delete<ApiResponse<{ room: Room }>>(`/admin/rooms/${roomId}/maintenance/${blockId}`),

  bookingReports: (params?: { period?: string; from?: string; to?: string }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/admin/reports/bookings', { params }),

  occupancyReport: (params?: { month?: number; year?: number }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/admin/reports/occupancy', { params }),

  popularRooms: (params?: { limit?: number }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/admin/reports/popular-rooms', { params }),

  bookingTrends: (params?: { months?: number }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/admin/reports/trends', { params }),

  bookingCalendar: (params?: { month?: number; year?: number; roomId?: string }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/admin/bookings/calendar', { params }),

  notifications: (params?: { page?: number; limit?: number; isRead?: string }) =>
    api.get<ApiResponse<Record<string, unknown>>>('/notifications', { params }),
}
