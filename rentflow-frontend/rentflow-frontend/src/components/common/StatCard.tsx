import type { ReactNode } from 'react'

export default function StatCard({
  label,
  value,
  icon,
  hint,
  testId,
}: {
  label: string
  value: string
  icon: ReactNode
  hint?: string
  testId?: string
}) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="rounded-lg bg-rf-cream-100 p-2 text-rf-navy-800">{icon}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-rf-navy-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
