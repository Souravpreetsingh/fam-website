import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, type CreateBookingData } from '../api/bookings'
import toast from 'react-hot-toast'

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (params?: Record<string, unknown>) => ['bookings', 'list', params] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
}

export function useMyBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: bookingKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await bookingsApi.getMyBookings(params)
      return data.data!
    },
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const { data } = await bookingsApi.getById(id)
      return data.data!
    },
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      const { data } = await bookingsApi.create(bookingData)
      return data.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      toast.success('Booking created successfully')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to create booking')
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await bookingsApi.cancel(id, reason)
      return data.data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      toast.success('Booking cancelled')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    },
  })
}
