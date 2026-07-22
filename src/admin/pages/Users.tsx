import { useState } from 'react'
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from '../api/adminHooks'
import { InlineLoader } from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ id: string; name: string; role: string } | null>(null)

  const { data, isLoading, error } = useAdminUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined } as { page?: number; limit?: number; role?: string; search?: string })
  const updateRole = useUpdateUserRole()
  const deleteMutation = useDeleteUser()

  const users = data?.users || []
  const pagination = data?.pagination

  const handleRoleChange = async () => {
    if (!roleChangeTarget) return
    const newRole = roleChangeTarget.role === 'admin' ? 'guest' as const : 'admin' as const
    await updateRole.mutateAsync({ id: roleChangeTarget.id, role: newRole })
    setRoleChangeTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget)
    setDeleteTarget(null)
  }

  if (isLoading) return <InlineLoader />
  if (error) return <div className="text-center py-16 text-red-400">Failed to load users.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white">Users</h1>
        <p className="text-white/40 text-sm mt-1">Manage registered users</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#C9A86A]/50 w-64" />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C9A86A]/50">
          <option value="">All Roles</option>
          <option value="guest">Guest</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Verified</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><span className="text-white font-medium">{u.name}</span></td>
                  <td className="px-4 py-3 text-white/60">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isVerified ? <span className="text-green-400 text-xs">Verified</span> : <span className="text-red-400 text-xs">Unverified</span>}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setRoleChangeTarget({ id: u._id, name: u.name, role: u.role })} className="px-3 py-1.5 rounded-lg text-xs text-[#C9A86A] hover:bg-white/5 transition-all mr-1">
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button onClick={() => setDeleteTarget(u._id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-white/5 transition-all">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Previous</button>
          <span className="text-white/40 text-sm px-3">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage} className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}

      <ConfirmModal open={!!roleChangeTarget} title="Change User Role" message={`Toggle admin role for ${roleChangeTarget?.name}?`} loading={updateRole.isPending} onConfirm={handleRoleChange} onCancel={() => setRoleChangeTarget(null)} />
      <ConfirmModal open={!!deleteTarget} title="Delete User" message="Are you sure? This will cancel all their bookings." variant="danger" loading={deleteMutation.isPending} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
