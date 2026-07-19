import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import StatusBadge from '@/components/common/StatusBadge'
import { userService } from '@/services/userService'
import type { AccountStatus, Role, User } from '@/types'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setLoading(true)
    userService
      .list()
      .then(setUsers)
      .finally(() => setLoading(false))
  }

  async function handleRoleChange(userId: string, role: Role) {
    setPendingId(userId)
    try {
      const updated = await userService.updateRole(userId, role)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } finally {
      setPendingId(null)
    }
  }

  async function handleStatusChange(userId: string, status: AccountStatus) {
    setPendingId(userId)
    try {
      const updated = await userService.updateStatus(userId, status)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(userId: string) {
    setPendingId(userId)
    try {
      await userService.remove(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setConfirmDeleteId(null)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <AdminLayout
      pageTitle="User management"
      pageDescription="View every registered account, adjust roles, and manage account status."
    >
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm" data-testid="users-table">
          <thead className="border-b border-slate-100 bg-rf-cream-100/60 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-slate-400">
                  Loading users…
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} data-testid={`user-row-${u.id}`}>
                  <td className="px-5 py-3.5 font-medium text-rf-navy-900">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      disabled={pendingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      data-testid={`user-role-select-${u.id}`}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={u.status} />
                      {u.status === 'active' ? (
                        <button
                          type="button"
                          disabled={pendingId === u.id}
                          onClick={() => handleStatusChange(u.id, 'suspended')}
                          data-testid={`user-suspend-${u.id}`}
                          className="text-xs font-medium text-amber-700 hover:underline"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={pendingId === u.id}
                          onClick={() => handleStatusChange(u.id, 'active')}
                          data-testid={`user-reactivate-${u.id}`}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {confirmDeleteId === u.id ? (
                      <span className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          data-testid={`user-delete-confirm-${u.id}`}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-slate-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(u.id)}
                        data-testid={`user-delete-${u.id}`}
                        aria-label={`Delete ${u.name}`}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
