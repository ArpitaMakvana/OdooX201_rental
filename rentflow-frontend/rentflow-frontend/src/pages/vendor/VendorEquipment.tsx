import { useEffect, useState, type FormEvent } from 'react'
import { Package, Tag, Plus, X, Loader2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import VendorLayout from '@/components/vendor/VendorLayout'
import { vendorService, type VendorEquipment, type CreateEquipmentPayload } from '@/services/vendorService'

export default function VendorEquipmentPage() {
  const [equipment, setEquipment] = useState<VendorEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateEquipmentPayload>({
    name: '',
    category: 'Tools',
    dailyRate: 1000,
    brand: '',
    description: '',
    available: true,
  })

  const fetchEquipment = () => {
    setLoading(true)
    vendorService
      .getEquipment()
      .then(setEquipment)
      .catch(() => setError('Failed to load equipment'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const handleToggleStatus = async (item: VendorEquipment) => {
    const newStatus = !item.available
    setTogglingId(item.id)

    // Optimistic UI update
    setEquipment((prev) =>
      prev.map((e) => (e.id === item.id ? { ...e, available: newStatus } : e)),
    )

    try {
      const updated = await vendorService.updateEquipmentStatus(item.id, newStatus)
      setEquipment((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, available: updated.available } : e)),
      )
    } catch {
      // Rollback on error
      setEquipment((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, available: item.available } : e)),
      )
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.category.trim() || formData.dailyRate <= 0) {
      setFormError('Please provide a valid name, category, and daily rate.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const newItem = await vendorService.addEquipment(formData)
      setEquipment((prev) => [newItem, ...prev])
      setIsModalOpen(false)
      setFormData({
        name: '',
        category: 'Tools',
        dailyRate: 1000,
        brand: '',
        description: '',
        available: true,
      })
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create equipment.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <VendorLayout
      pageTitle="My Equipment"
      pageDescription="All equipment you've listed for rent on your branch."
    >
      {/* Header controls: Search & Add Equipment button */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-rf-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          data-testid="add-equipment-button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rf-mint-500 px-4 py-2.5 text-sm font-semibold text-rf-navy-950 hover:bg-rf-mint-400 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Equipment
        </button>
      </div>

      {loading && (
        <div className="py-20 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-rf-mint-500" />
          Loading equipment…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-400 mb-4">
                {search ? 'No equipment matches your search.' : 'No equipment listed yet.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-rf-navy-900 px-4 py-2 text-xs font-semibold text-white hover:bg-rf-navy-800"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Equipment Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between"
                  data-testid={`equipment-card-${item.id}`}
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rf-cream-100 shrink-0">
                        <Package className="h-5 w-5 text-rf-navy-900" />
                      </div>

                      {/* Status Toggle Switch / Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={togglingId === item.id}
                        data-testid={`toggle-status-${item.id}`}
                        title="Click to toggle availability"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                          item.available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {togglingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : item.available ? (
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-rose-500" />
                        )}
                        <span>{item.available ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </div>

                    <p className="font-display text-sm font-semibold text-rf-navy-900">{item.name}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Tag className="h-3 w-3" />
                      {item.category} {item.brand ? `• ${item.brand}` : ''}
                    </div>

                    {item.description && (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="text-sm font-bold text-rf-navy-900">
                      ₹{Number(item.dailyRate).toFixed(2)}{' '}
                      <span className="text-xs font-normal text-slate-400">/ day</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-display text-lg font-bold text-rf-navy-900">Add New Equipment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rf-navy-900 mb-1">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar Excavator 320"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-equipment-name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rf-navy-900 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    data-testid="input-equipment-category"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  >
                    <option value="Tools">Tools</option>
                    <option value="Construction">Construction</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Generators">Generators</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Vehicles">Vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rf-navy-900 mb-1">
                    Daily Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                    data-testid="input-equipment-daily-rate"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rf-navy-900 mb-1">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bosch, CAT, Honda"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  data-testid="input-equipment-brand"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rf-navy-900 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief specifications or features..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-equipment-description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div>
                  <span className="block text-xs font-semibold text-rf-navy-900">
                    Initial Status
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formData.available ? 'Ready for rent' : 'Currently out of stock'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, available: !formData.available })}
                  data-testid="input-equipment-available"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    formData.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {formData.available ? 'Available' : 'Unavailable'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="submit-equipment-button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-rf-mint-500 px-5 py-2 text-xs font-semibold text-rf-navy-950 hover:bg-rf-mint-400 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VendorLayout>
  )
}
