export default function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-rf-cream-100"
      role="status"
      aria-live="polite"
      data-testid="full-page-spinner"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-rf-navy-700 border-t-rf-mint-500" />
      <p className="text-sm text-rf-navy-700">{label}</p>
    </div>
  )
}
