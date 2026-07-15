import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080A]/80 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 md:px-8 py-3">
        <a href="/" className="font-display text-xl text-white tracking-tight">
          Flamingo aur Maina
        </a>

        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm text-white/70 hover:text-white transition-colors font-body tracking-wide">
            Home
          </a>
          <Link to="/rooms" className="text-sm text-white/70 hover:text-white transition-colors font-body tracking-wide">
            Rooms
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="text-sm text-white/70 hover:text-white transition-colors font-body tracking-wide">
                My Bookings
              </Link>
              <Link to="/profile" className="text-sm text-white/70 hover:text-white transition-colors font-body tracking-wide">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white transition-colors font-body tracking-wide">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white/70"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#06080A]/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-4 gap-3">
            <a href="/" className="text-sm text-white/70 hover:text-white py-2">Home</a>
            <Link to="/rooms" onClick={() => setMobileOpen(false)} className="text-sm text-white/70 hover:text-white py-2">Rooms</Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" onClick={() => setMobileOpen(false)} className="text-sm text-white/70 hover:text-white py-2">My Bookings</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-white/70 hover:text-white py-2">Profile</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-left text-sm text-white/70 hover:text-white py-2">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-[#2E5E4E]">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
