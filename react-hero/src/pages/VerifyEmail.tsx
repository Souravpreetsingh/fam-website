import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Email verified successfully! You can now sign in.')
      })
      .catch((err: unknown) => {
        setStatus('error')
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setMessage(msg || 'Verification failed. The link may have expired.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          {status === 'loading' && (
            <div className="py-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-white/50 text-sm">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-white mb-2">Verified!</h2>
              <p className="text-white/60 text-sm mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-8 py-3 rounded-full bg-[#2E5E4E] text-white font-medium text-sm hover:bg-[#3a705e] transition-all"
              >
                Sign In
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-white mb-2">Verification Failed</h2>
              <p className="text-white/60 text-sm mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-8 py-3 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
