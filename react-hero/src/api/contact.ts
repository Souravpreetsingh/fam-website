import type { ApiResponse } from '../types'
import { api } from './axios'

export const contactApi = {
  submit: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post<ApiResponse<null>>('/contact', data),

  subscribeNewsletter: (email: string) =>
    api.post<ApiResponse<null>>('/contact/newsletter', { email }),
}
