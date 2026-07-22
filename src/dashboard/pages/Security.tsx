import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChangePassword } from '../api/userDashboardHooks'
import { useAuth } from '../../context/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type PasswordFormData = z.infer<typeof passwordSchema>

export default function Security() {
  const { logout } = useAuth()
  const changePassword = useChangePassword()
  const [showLogoutAll, setShowLogoutAll] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const sessions: { id: string; device: string; browser: string; ip: string; lastActive: string; isCurrent: boolean }[] = [
    { id: '1', device: 'Windows PC', browser: 'Chrome 126', ip: 'Current network', lastActive: 'Active now', isCurrent: true },
    { id: '2', device: 'iPhone 15', browser: 'Safari', ip: 'Previous network', lastActive: '2 days ago', isCurrent: false },
  ]

  const onSubmit = async (data: PasswordFormData) => {
    await changePassword.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    reset()
  }

  const handleLogoutAll = async () => {
    localStorage.removeItem('fam_active_sessions')
    await logout()
    toast.success('Logged out from all devices')
    setShowLogoutAll(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">Security</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account security</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-white font-display text-base mb-4">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Current Password</label>
              <input type="password" {...register('currentPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Enter current password" />
              {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1.5">New Password</label>
              <input type="password" {...register('newPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Min. 8 characters" />
              {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
          </div>
          <div className="max-w-xs">
            <label className="block text-white/60 text-sm mb-1.5">Confirm New Password</label>
            <input type="password" {...register('confirmPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Re-enter new password" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={changePassword.isPending} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
            {changePassword.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-display text-base">Active Sessions</h2>
          <button onClick={() => setShowLogoutAll(true)} className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">
            Logout All Devices
          </button>
        </div>
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                    <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm">
                    {session.device} &middot; {session.browser}
                    {session.isCurrent && <span className="text-emerald-400 ml-2 text-xs">(Current)</span>}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">{session.ip}</p>
                </div>
              </div>
              <span className="text-white/30 text-xs">{session.lastActive}</span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutAll}
        title="Logout All Devices"
        message="This will sign you out from all active sessions, including this one. You'll need to log in again."
        confirmLabel="Logout All"
        variant="danger"
        onConfirm={handleLogoutAll}
        onCancel={() => setShowLogoutAll(false)}
      />
    </div>
  )
}
