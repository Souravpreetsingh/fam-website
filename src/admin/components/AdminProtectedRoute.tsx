import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/LoadingSpinner'

function RedirectToHome() {
  useEffect(() => { window.location.href = '/' }, [])
  return null
}

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <RedirectToHome />

  return <>{children}</>
}
