import { useEffect, useState } from 'react'
import { Calculator, Save } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { configService } from '@/services/rentalService'
import type { LateFeePolicy } from '@/types'

const TABS = ['Late Fee Rules', 'Quotation Builder', 'Notifications', 'Branch Details'] as const

function computePreview(policy: LateFeePolicy, baseRental: number, lateHours: number) {
  let billedHours = lateHours
  if (policy.roundingLogic === 'nearest_hour') billedHours = Math.ceil(lateHours)
  if (policy.roundingLogic === 'nearest_15') billedHours = Math.ceil(lateHours * 4) / 4

  const rawFine = billedHours * policy.hourlyRate
  const lateFine = Math.min(rawFine, policy.dailyMaxLimit)
  return { lateFine, total: baseRental + lateFine }
}

export default function Configuration() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Late Fee Rules')
  const [policy, setPolicy] = useState<LateFeePolicy | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSavedLabel, setLastSavedLabel] = useState('a moment ago')

  useEffect(() => {
    configService.getLateFeePolicy().then(setPolicy)
  }, [])

  function update<K extends keyof LateFeePolicy>(key: K, value: LateFeePolicy[K]) {
    setPolicy((prev) => (prev ? { ...prev, [key]: value } : prev))
    setDirty(true)
  }

  async function handleSave() {
    if (!policy) return
    setSaving(true)
    try {
      await configService.saveLateFeePolicy(policy)
      setDirty(false)
      setLastSavedLabel('just now')
    } finally {
      setSaving(false)
    }
  }

  async function handleDiscard() {
    const fresh = await configService.getLateFeePolicy()
    setPolicy(fresh)
    setDirty(false)
  }

  if (!policy) {
    return (
      <AdminLayout pageTitle="General settings">
        <p className="text-sm text-slate-400">Loading configuration…</p>
      </AdminLayout>
    )
  }

  const preview = computePreview(policy, 120, 3)

  return (
    <AdminLayout
      pageTitle="General settings"
      pageDescription="Configure rules, templates, and operational branch details for RentFlow Solutions."
    >
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm" data-testid="config-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            data-testid={`config-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-rf-navy-900 text-white'
                : 'text-slate-500 hover:bg-rf-cream-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Late Fee Rules' ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          {activeTab} settings live here — same pattern as Late Fee Rules, wired to its own
          section of the config API.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-rf-navy-900">
                    Fine calculation
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Determine how automated fees are applied to late returns.
                  </p>
                </div>
                <Calculator className="h-5 w-5 text-rf-navy-800" />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="grace" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                    Grace period (minutes)
                  </label>
                  <input
                    id="grace"
                    type="number"
                    min={0}
                    value={policy.gracePeriodMinutes}
                    onChange={(e) => update('gracePeriodMinutes', Number(e.target.value))}
                    data-testid="config-grace-period"
                    className="w-full rounded-lg border border-slate-200 bg-rf-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Time allowed after return deadline before fines start.
                  </p>
                </div>

                <div>
                  <label htmlFor="rate" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                    Hourly rate ($)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    min={0}
                    step={0.5}
                    value={policy.hourlyRate}
                    onChange={(e) => update('hourlyRate', Number(e.target.value))}
                    data-testid="config-hourly-rate"
                    className="w-full rounded-lg border border-slate-200 bg-rf-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  />
                </div>

                <div>
                  <label htmlFor="dailyMax" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                    Daily maximum limit ($)
                  </label>
                  <input
                    id="dailyMax"
                    type="number"
                    min={0}
                    value={policy.dailyMaxLimit}
                    onChange={(e) => update('dailyMaxLimit', Number(e.target.value))}
                    data-testid="config-daily-max"
                    className="w-full rounded-lg border border-slate-200 bg-rf-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  />
                </div>

                <div>
                  <label htmlFor="rounding" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                    Rounding logic
                  </label>
                  <select
                    id="rounding"
                    value={policy.roundingLogic}
                    onChange={(e) =>
                      update('roundingLogic', e.target.value as LateFeePolicy['roundingLogic'])
                    }
                    data-testid="config-rounding-logic"
                    className="w-full rounded-lg border border-slate-200 bg-rf-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                  >
                    <option value="nearest_hour">Round Up to Nearest Hour</option>
                    <option value="nearest_15">Round Up to Nearest 15 Minutes</option>
                    <option value="exact">Exact — No Rounding</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-rf-navy-900">
                Escalation rules
              </h2>

              <div className="mt-4 space-y-3">
                <label
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"
                  htmlFor="autoLock"
                >
                  <div>
                    <p className="text-sm font-medium text-rf-navy-900">Auto-lock account</p>
                    <p className="text-xs text-slate-400">
                      Lock client rentals if fees exceed ${policy.autoLockAtAmount}
                    </p>
                  </div>
                  <input
                    id="autoLock"
                    type="checkbox"
                    checked={policy.autoLockEnabled}
                    onChange={(e) => update('autoLockEnabled', e.target.checked)}
                    data-testid="config-auto-lock"
                    className="h-5 w-5 accent-rf-navy-900"
                  />
                </label>

                <label
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"
                  htmlFor="legalDraft"
                >
                  <div>
                    <p className="text-sm font-medium text-rf-navy-900">Legal auto-draft</p>
                    <p className="text-xs text-slate-400">
                      Generate legal notice after 7 days overdue
                    </p>
                  </div>
                  <input
                    id="legalDraft"
                    type="checkbox"
                    checked={policy.legalAutoDraftEnabled}
                    onChange={(e) => update('legalAutoDraftEnabled', e.target.checked)}
                    data-testid="config-legal-draft"
                    className="h-5 w-5 accent-rf-navy-900"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl bg-rf-navy-900 p-6 text-white">
            <h3 className="font-display text-base font-semibold">Policy preview</h3>
            <p className="mt-1 text-sm text-slate-300">
              Based on your rules, a customer returning 3 hours late will be charged:
            </p>
            <dl className="mt-5 space-y-2 font-mono text-sm">
              <div className="flex justify-between text-slate-300">
                <dt>Base rental:</dt>
                <dd>$120.00</dd>
              </div>
              <div className="flex justify-between text-slate-300">
                <dt>Late fine (3h):</dt>
                <dd data-testid="preview-late-fine">${preview.lateFine.toFixed(2)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-rf-navy-700 pt-4">
              <span className="font-display text-lg font-bold">Total:</span>
              <span className="font-display text-lg font-bold" data-testid="preview-total">
                ${preview.total.toFixed(2)}
              </span>
            </div>
            <p className="mt-5 rounded-lg bg-rf-navy-800 p-3 text-xs italic text-slate-300">
              "Rentals must be returned within {policy.gracePeriodMinutes} minutes of the deadline
              to avoid a ${policy.hourlyRate.toFixed(2)}/hour penalty."
            </p>
          </aside>
        </div>
      )}

      {dirty && (
        <div className="fixed bottom-6 right-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
          <div>
            <p className="text-sm font-medium text-rf-navy-900">Settings are unsaved</p>
            <p className="text-xs text-slate-400">Last saved {lastSavedLabel} by Admin</p>
          </div>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rf-cream-100"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            data-testid="config-save"
            className="flex items-center gap-2 rounded-lg bg-rf-navy-900 px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
