import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './LoadingSpinner'

function dashboardFor(user: { role?: string } | null): string {
  if (user?.role === 'admin') return '/admin/dashboard'
  return '/dashboard'
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <PageLoader />
  if (isAuthenticated) return <Navigate to={dashboardFor(user)} replace />
  return <>{children}</>
}
