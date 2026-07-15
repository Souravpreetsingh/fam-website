import { useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

const NOTIF_PREFS_KEY = 'fam_notification_prefs'
const LANG_KEY = 'fam_lang_pref'

interface NotificationPrefs {
  bookingConfirmations: boolean
  paymentConfirmations: boolean
  promotionalOffers: boolean
  systemNotifications: boolean
}

function loadPrefs(): NotificationPrefs {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || '{"bookingConfirmations":true,"paymentConfirmations":true,"promotionalOffers":false,"systemNotifications":true}')
  } catch {
    return { bookingConfirmations: true, paymentConfirmations: true, promotionalOffers: false, systemNotifications: true }
  }
}

function savePrefs(p: NotificationPrefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(p))
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-all ${checked ? 'bg-[#2E5E4E]' : 'bg-white/10'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  )
}

export default function Settings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs)
  const [showDelete, setShowDelete] = useState(false)
  const [language, setLanguageState] = useState(localStorage.getItem(LANG_KEY) || 'en')

  const handlePrefChange = (key: keyof NotificationPrefs) => (value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    savePrefs(next)
    toast.success('Preferences updated')
  }

  const handleLanguageChange = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem(LANG_KEY, lang)
    toast.success('Language preference saved')
  }

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not available yet. Please contact support.')
    setShowDelete(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-white font-display text-base mb-4">Email Notifications</h2>
        <div className="space-y-4">
          {([
            { key: 'bookingConfirmations' as const, label: 'Booking Confirmations', desc: 'Receive emails when a booking is confirmed or modified' },
            { key: 'paymentConfirmations' as const, label: 'Payment Confirmations', desc: 'Get notified about payment status changes' },
            { key: 'promotionalOffers' as const, label: 'Promotional Offers', desc: 'Receive special offers and discounts' },
            { key: 'systemNotifications' as const, label: 'System Notifications', desc: 'Important account and security updates' },
          ]).map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{item.label}</p>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
              <Toggle checked={prefs[item.key]} onChange={handlePrefChange(item.key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-white font-display text-base mb-4">Language</h2>
        <p className="text-white/40 text-xs mb-3">Interface language (more languages coming soon)</p>
        <select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50"
        >
          <option value="en" className="bg-[#0C0E12]">English</option>
          <option value="hi" className="bg-[#0C0E12]" disabled>Hindi (coming soon)</option>
          <option value="fr" className="bg-[#0C0E12]" disabled>French (coming soon)</option>
        </select>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
        <h2 className="text-white font-display text-base mb-2">Danger Zone</h2>
        <p className="text-white/40 text-xs mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button onClick={() => setShowDelete(true)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 transition-all">
          Delete Account
        </button>
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account, bookings, and all associated data. Please contact support if you need assistance."
        confirmLabel="Delete Account"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
