import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, ReceiptText } from 'lucide-react'
import VendorLayout from '@/components/vendor/VendorLayout'
import StatCard from '@/components/common/StatCard'
import { vendorService, type VendorEarnings } from '@/services/vendorService'

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<VendorEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    vendorService
      .getEarnings()
      .then(setEarnings)
      .catch(() => setError('Failed to load earnings'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <VendorLayout
      pageTitle="Earnings"
      pageDescription="Track your rental revenue, monthly trends, and completed transactions."
    >
      {loading && (
        <div className="py-20 text-center text-sm text-slate-400">Loading earnings…</div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {earnings && (
        <>
          {/* Summary stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCard
              label="Total Earnings"
              value={`₹${earnings.total.toFixed(2)}`}
              icon={<Wallet className="h-4 w-4" />}
              testId="stat-total-earnings"
            />
            <StatCard
              label="This Month"
              value={`₹${(earnings.byMonth[earnings.byMonth.length - 1]?.amount ?? 0).toFixed(2)}`}
              icon={<TrendingUp className="h-4 w-4" />}
              testId="stat-this-month"
            />
            <StatCard
              label="Transactions"
              value={String(earnings.transactions.length)}
              icon={<ReceiptText className="h-4 w-4" />}
              testId="stat-transactions"
            />
          </div>

          {/* Monthly bar chart */}
          {earnings.byMonth.length > 0 && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 font-display text-base font-semibold text-rf-navy-900">
                Monthly Breakdown
              </h2>
              <div className="flex items-end gap-3 overflow-x-auto pb-2">
                {earnings.byMonth.map(({ month, amount }) => {
                  const maxVal = Math.max(...earnings.byMonth.map((m) => m.amount), 1)
                  const height = Math.max(8, (amount / maxVal) * 120)
                  return (
                    <div key={month} className="flex flex-col items-center gap-1 min-w-[52px]">
                      <span className="text-xs font-semibold text-rf-navy-900">
                        ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                      </span>
                      <div
                        className="w-10 rounded-t-md bg-rf-mint-400 transition-all"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[10px] text-slate-400">{month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Transaction history */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-display text-base font-semibold text-rf-navy-900">
                Transaction History
              </h2>
            </div>
            {earnings.transactions.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                No completed rentals yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-medium text-rf-navy-900">{t.itemName}</td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-rf-navy-900">
                        ₹{t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </VendorLayout>
  )
}
