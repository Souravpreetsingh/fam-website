import type { ApiResponse, PaginationMeta } from '../types'
import { api } from './axios'

export interface NotificationItem {
  _id: string
  user: string
  type: 'booking_submitted' | 'booking_confirmed' | 'booking_cancelled' | 'booking_modified' | 'booking_expired' | 'payment_received' | 'check_in_reminder' | 'check_out_reminder' | 'review_approved' | 'promo' | 'system'
  title: string
  message: string
  isRead: boolean
  link: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
  pagination: PaginationMeta
}

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; isRead?: string }) =>
    api.get<ApiResponse<NotificationsResponse>>('/notifications', { params }),

  markAsRead: (id: string) =>
    api.put<ApiResponse<{ notification: NotificationItem }>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<ApiResponse<null>>('/notifications/read-all'),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`),
}
