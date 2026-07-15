export interface DashboardStats {
  totalUsers: number
  totalBookings: number
  totalRooms: number
  totalRevenue: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  unreadContacts: number
  pendingReviews: number
  activeSubscribers: number
}

export interface RevenueByMonth {
  _id: { year: number; month: number }
  revenue: number
  count: number
  bookings: number
}

export interface BookingStat {
  _id: string
  count: number
}

export interface RevenueByRoom {
  _id: string
  room: { name: string }
  revenue: number
  bookings: number
}

export interface DashboardData {
  stats: DashboardStats
  recentBookings: import('../../types').Booking[]
  revenueByMonth: RevenueByMonth[]
  bookingStats: BookingStat[]
}

export interface RevenueAnalytics {
  totalRevenue: number
  totalPaidBookings: number
  totalBookings: number
  revenueByRoom: RevenueByRoom[]
  revenueByMonth: RevenueByMonth[]
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  phone: string
  role: 'guest' | 'admin'
  isVerified: boolean
  createdAt: string
  updatedAt: string
  bookings?: import('../../types').Booking[]
}

export interface AdminContact {
  _id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface AdminNewsletter {
  _id: string
  email: string
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
}
