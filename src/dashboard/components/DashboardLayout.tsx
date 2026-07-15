import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import Breadcrumbs from './Breadcrumbs'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#06080A]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-[#0C0E12]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <Link to="/" className="text-sm text-white/40 hover:text-white transition-colors hidden sm:block">
                Back to Site
              </Link>
              <span className="text-white/50 text-sm hidden md:block">{user?.email}</span>
              <Link
                to="/dashboard/notifications"
                className="relative text-white/40 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </Link>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <div className="px-4 md:px-6 pt-4 pb-2">
          <Breadcrumbs />
        </div>
        <main className="p-4 md:p-6 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
