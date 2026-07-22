import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserProfile, useUpdateProfile, useChangePassword } from '../api/userDashboardHooks'
import { Skeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z.string().regex(/^\+?[\d\s-]{7,15}$/, 'Invalid phone number').or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function Profile() {
  const { data: user, isLoading } = useUserProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const { register: regProfile, handleSubmit: handleSubmitProfile, reset, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name || '', phone: user.phone || '' } : undefined,
  })

  const { register: regPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: pwdErrors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync(data)
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    await changePassword.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword })
    resetPassword()
    toast.success('Password changed successfully')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {Array.from({length: 3}).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">My Profile</h1>
        <p className="text-white/40 text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white font-display overflow-hidden">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <p className="text-white/30 text-xs mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Full Name</label>
              <input {...regProfile('name')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Your name" />
              {profileErrors.name && <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Phone</label>
              <input {...regProfile('phone')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="+91 98765 43210" />
              {profileErrors.phone && <p className="text-red-400 text-xs mt-1">{profileErrors.phone.message}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={updateProfile.isPending} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => reset()} className="px-6 py-2.5 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-white font-display text-lg mb-4">Change Password</h2>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Current Password</label>
              <input type="password" {...regPassword('currentPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="••••••••" />
              {pwdErrors.currentPassword && <p className="text-red-400 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1.5">New Password</label>
              <input type="password" {...regPassword('newPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Min. 8 characters" />
              {pwdErrors.newPassword && <p className="text-red-400 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
          </div>
          <div className="max-w-xs">
            <label className="block text-white/60 text-sm mb-1.5">Confirm New Password</label>
            <input type="password" {...regPassword('confirmPassword')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C9A86A]/50 transition-colors" placeholder="Re-enter new password" />
            {pwdErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={changePassword.isPending} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all disabled:opacity-50">
            {changePassword.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
