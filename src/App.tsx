import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute, GuestRoute } from './components/ui/ProtectedRoute'
import AdminProtectedRoute from './admin/components/AdminProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import DashboardLayout from './dashboard/components/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import AdminLogin from './admin/pages/AdminLogin'
import AdminDashboard from './admin/pages/Dashboard'
import AdminBookings from './admin/pages/Bookings'
import AdminRooms from './admin/pages/Rooms'
import AdminUsers from './admin/pages/Users'
import AdminReviews from './admin/pages/Reviews'
import AdminContact from './admin/pages/Contact'
import AdminBookingManagement from './admin/pages/BookingManagement'
import AdminRoomStatus from './admin/pages/RoomStatus'
import AdminReports from './admin/pages/Reports'
import DashboardHome from './dashboard/pages/DashboardHome'
import DashboardProfile from './dashboard/pages/Profile'
import DashboardBookings from './dashboard/pages/MyBookings'
import DashboardBookingDetail from './dashboard/pages/BookingDetail'
import DashboardFavorites from './dashboard/pages/Favorites'
import DashboardReviews from './dashboard/pages/Reviews'
import DashboardPayments from './dashboard/pages/Payments'
import DashboardSettings from './dashboard/pages/Settings'
import DashboardSecurity from './dashboard/pages/Security'
import DashboardNotifications from './dashboard/pages/Notifications'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<GuestRoute><Layout /></GuestRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<Layout />}>
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<RoomDetail />} />
          <Route path="/rooms/:slug/book" element={<RoomDetail />} />
        </Route>

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/contact" element={<AdminContact />} />
          <Route path="/admin/bookings/manage" element={<AdminBookingManagement />} />
          <Route path="/admin/rooms/status" element={<AdminRoomStatus />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/profile" element={<DashboardProfile />} />
          <Route path="/dashboard/bookings" element={<DashboardBookings />} />
          <Route path="/dashboard/booking/:id" element={<DashboardBookingDetail />} />
          <Route path="/dashboard/favorites" element={<DashboardFavorites />} />
          <Route path="/dashboard/reviews" element={<DashboardReviews />} />
          <Route path="/dashboard/payments" element={<DashboardPayments />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />
          <Route path="/dashboard/security" element={<DashboardSecurity />} />
          <Route path="/dashboard/notifications" element={<DashboardNotifications />} />
        </Route>

        <Route path="*" element={<Layout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
