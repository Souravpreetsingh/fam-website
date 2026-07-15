import type { ApiResponse, Booking, PaginatedData, PaymentOrder } from '../types'
import { api } from './axios'

export interface CreateBookingData {
  room: string
  checkIn: string
  checkOut: string
  guests: { adults: number; children?: number }
  specialRequests?: string
}

export interface UpdateBookingData {
  checkIn?: string
  checkOut?: string
  guests?: { adults: number; children?: number }
  specialRequests?: string
}

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    api.post<ApiResponse<Booking>>('/bookings', data),

  getMyBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedData<Booking>>>('/bookings/my', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  update: (id: string, data: UpdateBookingData) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  cancel: (id: string, reason?: string) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }),

  createPaymentOrder: (bookingId: string) =>
    api.post<ApiResponse<PaymentOrder>>('/payments/create-order', { bookingId }),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post<ApiResponse<null>>('/payments/verify', data),

  getTimeline: (id: string) =>
    api.get<ApiResponse<{ timeline: { status: string; changedAt: string; changedBy: string; note: string }[]; currentStatus: string }>>(`/bookings/${id}/timeline`),
}
