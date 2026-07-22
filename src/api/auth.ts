import type { ApiResponse, User } from '../types'
import { api } from './axios'

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<User>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<RefreshResponse>>('/auth/refresh-token', { refreshToken }),

  verifyEmail: (token: string) =>
    api.get<ApiResponse<null>>('/auth/verify-email', { params: { token } }),

  resendVerification: () =>
    api.post<ApiResponse<null>>('/auth/resend-verification'),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),

  getProfile: () =>
    api.get<ApiResponse<User>>('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<null>>('/users/change-password', data),
}
