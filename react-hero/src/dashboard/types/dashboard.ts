export interface DashboardStats {
  totalBookings: number
  completedStays: number
  upcomingStays: number
  cancelledBookings: number
  totalSpent: number
  loyaltyPoints: number
  memberSince: string
}

export interface DashboardNotification {
  id: string
  type: 'booking_confirmed' | 'payment_received' | 'booking_cancelled' | 'review_approved' | 'promo' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
}

export interface UserDashboardData {
  stats: DashboardStats
  upcomingBooking: import('../../types').Booking | null
  recentBookings: import('../../types').Booking[]
}
