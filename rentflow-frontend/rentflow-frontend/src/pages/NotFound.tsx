import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-rf-cream-100 px-4 text-center">
      <Compass className="h-10 w-10 text-rf-navy-800" />
      <h1 className="font-display text-2xl font-bold text-rf-navy-900">404 — Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-3 rounded-lg bg-rf-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Back home
      </Link>
    </div>
  )
}
