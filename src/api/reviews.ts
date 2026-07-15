import type { ApiResponse, PaginatedData, Review } from '../types'
import { api } from './axios'

export interface CreateReviewData {
  room: string
  booking?: string
  rating: number
  title?: string
  comment: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
}

export const reviewsApi = {
  getRoomReviews: (roomId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedData<Review>>>(`/reviews/room/${roomId}`, { params }),

  create: (data: CreateReviewData) =>
    api.post<ApiResponse<Review>>('/reviews', data),

  update: (id: string, data: UpdateReviewData) =>
    api.put<ApiResponse<Review>>(`/reviews/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}`),
}
