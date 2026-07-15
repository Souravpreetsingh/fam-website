import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#06080A]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-[#0C0E12]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-white/50 text-sm hidden md:block">{user?.email}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Admin
              </span>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
