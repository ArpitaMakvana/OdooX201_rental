import { useEffect, useState } from 'react'
import { Truck, Store } from 'lucide-react'
import VendorLayout from '@/components/vendor/VendorLayout'
import StatusBadge from '@/components/common/StatusBadge'
import { vendorService, type VendorBooking } from '@/services/vendorService'

/**
 * Status action matrix depends on fulfillment type:
 *
 * PICKUP flow:  PENDING → RESERVED → ACTIVE → COMPLETED
 * DELIVERY flow: PENDING → RESERVED → DELIVERED → ACTIVE → COMPLETED
 *
 * Vendor clicks Accept → RESERVED, then either prepares pickup or arranges delivery.
 */
function getStatusActions(status: string, deliveryType: string) {
  const isDelivery = deliveryType === 'DELIVERY'
  const map: Record<string, { label: string; next: string; color: string }[]> = {
    PENDING: [
      { label: 'Accept', next: 'RESERVED', color: 'bg-green-500 hover:bg-green-600 text-white' },
      { label: 'Reject', next: 'REJECTED', color: 'bg-red-500 hover:bg-red-600 text-white' },
    ],
    RESERVED: isDelivery
      ? [{ label: 'Mark Dispatched', next: 'DELIVERED', color: 'bg-blue-500 hover:bg-blue-600 text-white' }]
      : [{ label: 'Mark Picked Up', next: 'ACTIVE', color: 'bg-indigo-500 hover:bg-indigo-600 text-white' }],
    DELIVERED: [
      { label: 'Confirm Receipt → Active', next: 'ACTIVE', color: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    ],
    ACTIVE: [
      { label: 'Complete', next: 'COMPLETED', color: 'bg-rf-mint-500 hover:bg-rf-mint-400 text-rf-navy-950' },
      { label: 'Cancel', next: 'CANCELLED', color: 'bg-slate-400 hover:bg-slate-500 text-white' },
    ],
  }
  return map[status] ?? []
}

export default function VendorBookings() {
  const [bookings, setBookings] = useState<VendorBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    vendorService
      .getBookings()
      .then(setBookings)
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const statuses = ['ALL', 'PENDING', 'RESERVED', 'ACTIVE', 'DELIVERED', 'COMPLETED', 'REJECTED', 'CANCELLED']
  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter)

  const handleStatusChange = async (rentalId: string, newStatus: string) => {
    setUpdating(rentalId)
    try {
      const updated = await vendorService.updateBookingStatus(rentalId, newStatus)
      setBookings((prev) =>
        prev.map((b) => (b.id === rentalId ? { ...b, ...updated } : b)),
      )
      // Inform vendor of the next fulfillment action
      if (updated.fulfillmentAction === 'SCHEDULE_DELIVERY') {
        alert(`✅ Booking accepted!\n\n📦 DELIVERY ORDER\nPlease arrange home delivery to:\n${
          updated.deliveryAddress
            ? `${updated.deliveryAddress.street}, ${updated.deliveryAddress.city}, ${updated.deliveryAddress.state} ${updated.deliveryAddress.zipCode}`
            : 'Address not available'
        }`)
      } else if (updated.fulfillmentAction === 'PREPARE_PICKUP') {
        alert('✅ Booking accepted!\n\n🏪 STORE PICKUP\nPlease prepare the equipment for in-store collection.')
      }
    } catch {
      alert('Failed to update booking status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <VendorLayout
      pageTitle="Bookings"
      pageDescription="Review, accept, and manage customer booking requests."
    >
      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === s
                ? 'bg-rf-navy-900 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {s}
            {s !== 'ALL' && (
              <span className="ml-1 text-[10px] opacity-70">
                ({bookings.filter((b) => b.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-20 text-center text-sm text-slate-400">Loading bookings…</div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              No bookings for this status.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">Equipment</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Fulfillment</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const actions = getStatusActions(b.status, b.deliveryType ?? 'PICKUP')
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-rf-navy-900">{b.itemName}</p>
                        <p className="text-xs text-slate-400">{b.itemCategory}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-rf-navy-900">{b.customerName}</p>
                        <p className="text-xs text-slate-400">{b.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(b.startDate).toLocaleDateString()} →{' '}
                        {new Date(b.dueDate).toLocaleDateString()}
                      </td>
                      {/* Fulfillment Method column */}
                      <td className="px-5 py-4">
                        {b.deliveryType === 'DELIVERY' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              <Truck className="h-3 w-3" /> Home Delivery
                            </span>
                            {b.deliveryAddress && (
                              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                                {b.deliveryAddress.street}, {b.deliveryAddress.city}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            <Store className="h-3 w-3" /> Store Pickup
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-rf-navy-900">
                        ₹{b.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {actions.map(({ label, next, color }) => (
                            <button
                              key={next}
                              type="button"
                              disabled={updating === b.id}
                              onClick={() => handleStatusChange(b.id, next)}
                              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${color}`}
                            >
                              {updating === b.id ? '…' : label}
                            </button>
                          ))}
                          {actions.length === 0 && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </VendorLayout>
  )
}
