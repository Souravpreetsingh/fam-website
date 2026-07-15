import { useNotifications, getStoredNotifications, saveNotifications } from '../api/userDashboardHooks'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function NotificationIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    booking_confirmed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    payment_received: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    booking_cancelled: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    review_approved: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    promo: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 019.5 3H5l3 5h4zm0 0h4l3-5h-4.5A2.5 2.5 0 0012 5.5V8z',
    system: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C9A86A]">
      <path d={paths[type] || paths.system} />
    </svg>
  )
}

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications()
  const qc = useQueryClient()

  const list = notifications || []

  const handleMarkAllRead = () => {
    const updated = list.map(n => ({ ...n, isRead: true }))
    saveNotifications(updated)
    qc.invalidateQueries({ queryKey: ['dashboard', 'notifications'] })
    toast.success('All marked as read')
  }

  const handleToggleRead = (id: string) => {
    const updated = getStoredNotifications().map(n => n.id === id ? { ...n, isRead: !n.isRead } : n)
    saveNotifications(updated)
    qc.invalidateQueries({ queryKey: ['dashboard', 'notifications'] })
  }

  const handleDelete = (id: string) => {
    const updated = getStoredNotifications().filter(n => n.id !== id)
    saveNotifications(updated)
    qc.invalidateQueries({ queryKey: ['dashboard', 'notifications'] })
    toast.success('Notification deleted')
  }

  const unreadCount = list.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-white">Notifications</h1>
          <p className="text-white/40 text-sm mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#2E5E4E] hover:bg-[#3a705e] transition-all">
            Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          title="No notifications"
          description="You're all caught up! Notifications about your bookings and account will appear here."
        />
      ) : (
        <div className="space-y-2">
          {list.map(notification => (
            <div
              key={notification.id}
              className={`rounded-2xl border transition-all p-5 cursor-pointer ${
                notification.isRead ? 'border-white/5 bg-white/[0.01]' : 'border-white/10 bg-white/[0.03]'
              }`}
              onClick={() => handleToggleRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notification.isRead ? 'bg-white/[0.02]' : 'bg-white/5'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notification.isRead ? 'text-white/50' : 'text-white'}`}>
                      {notification.title}
                    </p>
                    <span className="text-white/20 text-xs shrink-0">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${notification.isRead ? 'text-white/30' : 'text-white/50'}`}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notification.id) }}
                  className="shrink-0 text-white/20 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
