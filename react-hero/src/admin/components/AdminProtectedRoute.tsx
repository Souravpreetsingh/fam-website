import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
