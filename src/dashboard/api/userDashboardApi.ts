import { api } from '../../api/axios'
import type { ApiResponse, PaginatedData, Booking, Room, User, Review } from '../../types'

export const userDashboardApi = {
  getMyBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedData<Booking>>>('/bookings/my', { params }),

  getBookingById: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }),

  updateBooking: (id: string, data: { checkIn?: string; checkOut?: string; guests?: { adults: number; children?: number }; specialRequests?: string }) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  createPaymentOrder: (bookingId: string) =>
    api.post<ApiResponse<import('../../types').PaymentOrder>>('/payments/create-order', { bookingId }),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post<ApiResponse<null>>('/payments/verify', data),

  getPayment: (id: string) =>
    api.get<ApiResponse<{ paymentId: string; bookingId: string; amount: number; currency: string; status: string; method: string; createdAt: string }>>(`/payments/${id}`),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/users/change-password', data),

  getProfile: () =>
    api.get<ApiResponse<User>>('/users/profile'),

  createReview: (data: { room: string; booking?: string; rating: number; title?: string; comment: string }) =>
    api.post<ApiResponse<Review>>('/reviews', data),

  updateReview: (id: string, data: { rating?: number; title?: string; comment?: string }) =>
    api.put<ApiResponse<Review>>(`/reviews/${id}`, data),

  deleteReview: (id: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}`),

  getRooms: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<PaginatedData<Room>>>('/rooms', { params }),

  getRoomById: (id: string) =>
    api.get<ApiResponse<Room>>(`/rooms/${id}`),
}
