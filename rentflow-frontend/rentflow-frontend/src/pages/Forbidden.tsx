import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Forbidden() {
  const { user } = useAuth()
  const homePath = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-rf-cream-100 px-4 text-center"
      data-testid="forbidden-page"
    >
      <ShieldAlert className="h-10 w-10 text-red-500" />
      <h1 className="font-display text-2xl font-bold text-rf-navy-900">403 — Access denied</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Your account doesn't have permission to view this page. If you think this is a mistake,
        contact your administrator.
      </p>
      <Link
        to={homePath}
        className="mt-3 rounded-lg bg-rf-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Back to my dashboard
      </Link>
    </div>
  )
}
