import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/auth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    setError('')
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-white mb-2">Forgot Password</h1>
            <p className="text-white/50 text-sm">We'll send you a reset link</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {sent ? (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-6 text-sm text-green-400 text-center">
              If an account with that email exists, we've sent a password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#2E5E4E] text-white font-medium text-sm tracking-wide hover:bg-[#3a705e] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                Send Reset Link
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/40">
            <Link to="/login" className="text-[#C9A86A] hover:text-[#d4b87a] transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
