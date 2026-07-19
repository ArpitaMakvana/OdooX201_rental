import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, PackageCheck, Search } from 'lucide-react'
import UserLayout from '@/components/user/UserLayout'
import StatCard from '@/components/common/StatCard'
import StatusBadge from '@/components/common/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { rentalService } from '@/services/rentalService'
import type { Rental } from '@/types'

export default function UserDashboard() {
  const { user } = useAuth()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rentalService
      .listMine()
      .then(setRentals)
      .finally(() => setLoading(false))
  }, [])

  const active = rentals.filter((r) => r.status === 'active')
  const overdue = rentals.filter((r) => r.status === 'overdue')

  return (
    <UserLayout
      pageTitle={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`}
      pageDescription="Here's what's happening with your rentals."
    >
      <div className="grid gap-4 sm:grid-cols-3" data-testid="user-dashboard-stats">
        <StatCard
          label="Active rentals"
          value={String(active.length)}
          icon={<PackageCheck className="h-4 w-4" />}
          testId="stat-active-rentals"
        />
        <StatCard
          label="Overdue items"
          value={String(overdue.length)}
          icon={<AlertTriangle className="h-4 w-4" />}
          hint={overdue.length > 0 ? 'Return promptly to avoid extra fees' : 'All caught up'}
          testId="stat-overdue-rentals"
        />
        <StatCard
          label="Next due date"
          value={rentals[0]?.dueDate ?? '—'}
          icon={<CalendarClock className="h-4 w-4" />}
          testId="stat-next-due"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-rf-navy-900">
            Recent activity
          </h2>
          <Link
            to="/browse"
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
          >
            <Search className="h-3.5 w-3.5" /> Browse rentals
          </Link>
        </div>

        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-400">Loading your rentals…</p>
        ) : rentals.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">
            You have no rentals yet. Browse available items to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100" data-testid="recent-rentals-list">
            {rentals.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-rf-navy-900">{r.itemName}</p>
                  <p className="text-xs text-slate-400">
                    Due {r.dueDate} · {r.category}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserLayout>
  )
}
