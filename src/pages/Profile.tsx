import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authApi.updateProfile({ name, phone })
      updateUser(data.data!)
      toast.success('Profile updated')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="mx-auto max-w-[800px] px-4 md:px-8 py-16 md:py-24">
        <h1 className="font-display text-3xl md:text-4xl text-white mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-white font-display text-xl mb-6">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors"
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-full bg-[#2E5E4E] text-white font-medium text-sm hover:bg-[#3a705e] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <LoadingSpinner size="sm" /> : null}
                Save Changes
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-white font-display text-xl mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 transition-colors"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-3 rounded-full border border-white/20 text-white font-medium text-sm hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {changingPassword ? <LoadingSpinner size="sm" /> : null}
                Update Password
              </button>
            </form>
          </div>
        </div>

        {!user?.isVerified && (
          <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-6 py-4">
            <p className="text-yellow-400 text-sm">
              Your email is not verified. Please check your inbox for the verification link.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
