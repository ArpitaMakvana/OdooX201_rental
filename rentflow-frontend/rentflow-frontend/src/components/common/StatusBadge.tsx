const STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  reserved: 'bg-sky-50 text-sky-700 ring-sky-200',
  returned: 'bg-slate-100 text-slate-600 ring-slate-200',
  overdue: 'bg-red-50 text-red-700 ring-red-200',
  suspended: 'bg-red-50 text-red-700 ring-red-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
}

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${style}`}
      data-testid={`status-badge-${status}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
