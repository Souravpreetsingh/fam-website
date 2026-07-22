import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { authApi } from '../api/auth'
import { setAccessToken } from '../api/axios'
import { STORAGE_KEYS } from '../lib/constants'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!storedRefresh) {
      setIsLoading(false)
      return
    }
    try {
      const { data: refreshData } = await authApi.refreshToken(storedRefresh)
      setAccessToken(refreshData.data!.accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshData.data!.refreshToken)
      const { data: profileData } = await authApi.getProfile()
      setUser(profileData.data!)
    } catch {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    const { user: userData, accessToken, refreshToken } = data.data!
    setAccessToken(accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    setUser(userData)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // ignore
    } finally {
      setAccessToken(null)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updated: User) => setUser(updated), [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
