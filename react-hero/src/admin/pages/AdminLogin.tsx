import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password)
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-white mb-1">Admin Login</h1>
          <p className="text-white/40 text-sm">Flamingo aur Maina</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email</label>
              <input type="email" {...register('email')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="admin@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Password</label>
              <input type="password" {...register('password')} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-[#2E5E4E] text-white text-sm font-medium hover:bg-[#3a705e] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <LoadingSpinner size="sm" /> : null}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
