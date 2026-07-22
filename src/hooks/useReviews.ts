import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi, type CreateReviewData } from '../api/reviews'
import toast from 'react-hot-toast'

export const reviewKeys = {
  all: ['reviews'] as const,
  byRoom: (roomId: string) => ['reviews', 'room', roomId] as const,
}

export function useRoomReviews(roomId: string) {
  return useQuery({
    queryKey: reviewKeys.byRoom(roomId),
    queryFn: async () => {
      const { data } = await reviewsApi.getRoomReviews(roomId)
      return data.data!
    },
    enabled: !!roomId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const { data } = await reviewsApi.create(reviewData)
      return data.data!
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byRoom(variables.room) })
      toast.success('Review submitted for approval')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId: string }) => {
      await reviewsApi.delete(id)
      return roomId
    },
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byRoom(roomId) })
      toast.success('Review deleted')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    },
  })
}
