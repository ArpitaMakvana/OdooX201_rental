import { useEffect, useState } from 'react'
import { AlertTriangle, Boxes, Users, Wallet } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/common/StatCard'
import StatusBadge from '@/components/common/StatusBadge'
import { userService } from '@/services/userService'
import { rentalService } from '@/services/rentalService'
import type { Rental, User } from '@/types'

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])

  useEffect(() => {
    userService.list().then(setUsers)
    rentalService.listMine().then(setRentals)
  }, [])

  const overdue = rentals.filter((r) => r.status === 'overdue')
  const activeUsers = users.filter((u) => u.status === 'active')
  const revenueAtRisk = overdue.reduce((sum, r) => sum + (r.lateFee ?? 0), 0)

  return (
    <AdminLayout
      pageTitle="Operations overview"
      pageDescription="System status and today's key metrics across all branches."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="admin-dashboard-stats">
        <StatCard
          label="Active accounts"
          value={String(activeUsers.length)}
          icon={<Users className="h-4 w-4" />}
          testId="stat-active-accounts"
        />
        <StatCard
          label="Rentals in flight"
          value={String(rentals.length)}
          icon={<Boxes className="h-4 w-4" />}
          testId="stat-rentals-in-flight"
        />
        <StatCard
          label="Overdue returns"
          value={String(overdue.length)}
          icon={<AlertTriangle className="h-4 w-4" />}
          hint={overdue.length > 0 ? 'Needs attention' : 'All clear'}
          testId="stat-overdue-returns"
        />
        <StatCard
          label="Late fees pending"
          value={`$${revenueAtRisk.toFixed(2)}`}
          icon={<Wallet className="h-4 w-4" />}
          testId="stat-fees-pending"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-rf-navy-900">
            Rentals needing attention
          </h2>
        </div>
        <ul className="divide-y divide-slate-100" data-testid="attention-rentals-list">
          {overdue.length === 0 ? (
            <li className="px-5 py-6 text-sm text-slate-400">Nothing overdue right now.</li>
          ) : (
            overdue.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-rf-navy-900">{r.itemName}</p>
                  <p className="text-xs text-slate-400">
                    Due {r.dueDate} · Fee ${r.lateFee?.toFixed(2)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))
          )}
        </ul>
      </div>
    </AdminLayout>
  )
}
