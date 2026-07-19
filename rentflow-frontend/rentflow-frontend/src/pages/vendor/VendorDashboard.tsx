import { useEffect, useState } from 'react'
import { Package, BookOpen, Wallet, TrendingUp } from 'lucide-react'
import VendorLayout from '@/components/vendor/VendorLayout'
import StatCard from '@/components/common/StatCard'
import StatusBadge from '@/components/common/StatusBadge'
import { vendorService, type VendorDashboardData } from '@/services/vendorService'

export default function VendorDashboard() {
  const [data, setData] = useState<VendorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    vendorService
      .getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <VendorLayout
      pageTitle="Vendor Dashboard"
      pageDescription="Your business overview — revenue, bookings, and equipment status."
    >
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          Loading dashboard…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="vendor-stats">
            <StatCard
              label="Total Equipment"
              value={String(data.totalEquipment)}
              icon={<Package className="h-4 w-4" />}
              testId="stat-total-equipment"
            />
            <StatCard
              label="Active Rentals"
              value={String(data.activeRentals)}
              icon={<TrendingUp className="h-4 w-4" />}
              testId="stat-active-rentals"
            />
            <StatCard
              label="Pending Requests"
              value={String(data.pendingRequests)}
              icon={<BookOpen className="h-4 w-4" />}
              hint={data.pendingRequests > 0 ? 'Needs action' : 'All clear'}
              testId="stat-pending-requests"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${data.totalRevenue.toFixed(2)}`}
              icon={<Wallet className="h-4 w-4" />}
              testId="stat-total-revenue"
            />
          </div>

          {/* Monthly Revenue Chart (simple bar) */}
          {data.monthlyRevenue.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 font-display text-base font-semibold text-rf-navy-900">
                Monthly Revenue
              </h2>
              <div className="flex items-end gap-3 overflow-x-auto pb-2">
                {data.monthlyRevenue.map(({ month, amount }) => {
                  const maxVal = Math.max(...data.monthlyRevenue.map((m) => m.amount), 1)
                  const pct = Math.max(4, (amount / maxVal) * 100)
                  return (
                    <div key={month} className="flex flex-col items-center gap-1 min-w-[48px]">
                      <span className="text-xs font-medium text-rf-navy-900">
                        ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                      </span>
                      <div
                        className="w-10 rounded-t-md bg-rf-mint-400"
                        style={{ height: `${pct}px` }}
                      />
                      <span className="text-[10px] text-slate-400">{month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-display text-base font-semibold text-rf-navy-900">
                Recent Bookings
              </h2>
            </div>
            <ul className="divide-y divide-slate-100" data-testid="vendor-recent-bookings">
              {data.recentBookings.length === 0 ? (
                <li className="px-5 py-6 text-sm text-slate-400">No bookings yet.</li>
              ) : (
                data.recentBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-rf-navy-900">{b.itemName}</p>
                      <p className="text-xs text-slate-400">
                        {b.customerName} · {new Date(b.startDate).toLocaleDateString()} →{' '}
                        {new Date(b.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-rf-navy-900">
                        ₹{b.amount.toFixed(2)}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </VendorLayout>
  )
}
