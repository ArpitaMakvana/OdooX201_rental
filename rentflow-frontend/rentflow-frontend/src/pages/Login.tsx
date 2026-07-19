import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, LogIn, ShieldCheck, Store, TriangleAlert, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [branch, setBranch] = useState('main-branch')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      const user = await login({ branch, identifier, password })
      if (user.status === 'pending') {
        navigate('/pending-approval', { replace: true })
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'vendor') {
        navigate('/vendor', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch {
      // error state is surfaced via context
    } finally {
      setSubmitting(false)
    }
  }

  const quickFill = (email: string, pw: string, br: string) => {
    setIdentifier(email)
    setPassword(pw)
    setBranch(br)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rf-navy-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <ShieldCheck className="mb-3 h-9 w-9 text-rf-mint-400" />
          <h1 className="font-display text-3xl font-bold">RentFlow Portal</h1>
          <p className="mt-1 text-xs tracking-widest text-slate-400">
            RENTAL MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="rounded-2xl bg-rf-cream-50 p-8 shadow-xl">
          <h2 className="font-display text-xl font-semibold text-rf-navy-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each role is automatically redirected to the correct portal.
          </p>

          {/* Quick login pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => quickFill('admin@rentflow.io', 'admin123', 'main-branch')}
              className="flex items-center gap-1 rounded-full bg-rf-navy-900 px-3 py-1 text-xs font-medium text-white hover:opacity-80"
            >
              <ShieldCheck className="h-3 w-3" /> Admin
            </button>
            <button
              type="button"
              onClick={() => quickFill('vendor@rentflow.io', 'vendor123', 'gandhinagar')}
              className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:opacity-80"
            >
              <Store className="h-3 w-3" /> Vendor
            </button>
            <button
              type="button"
              onClick={() => quickFill('tom@example.com', 'user123', 'main-branch')}
              className="flex items-center gap-1 rounded-full bg-slate-600 px-3 py-1 text-xs font-medium text-white hover:opacity-80"
            >
              <UserIcon className="h-3 w-3" /> Customer
            </button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} data-testid="login-form">
            <div>
              <label htmlFor="branch" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Branch
              </label>
              <select
                id="branch"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                data-testid="login-branch"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              >
                <option value="main-branch">Main Branch</option>
                <option value="ahmedabad">Ahmedabad</option>
                <option value="gandhinagar">Gandhinagar</option>
              </select>
            </div>

            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Email
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="identifier"
                  type="text"
                  required
                  placeholder="e.g. admin@rentflow.io"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  data-testid="login-identifier"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-rf-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-rf-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                data-testid="login-error"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="login-submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rf-navy-900 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In to Portal'}
              <LogIn className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-rf-navy-900">Portal Guide:</p>
            <p>🛡️ Admin → /admin &nbsp;|&nbsp; 🏪 Vendor → /vendor &nbsp;|&nbsp; 👤 Customer → /dashboard</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Admin: main-branch &nbsp;·&nbsp; Vendor: gandhinagar &nbsp;·&nbsp; Customer: main-branch
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            New customer?{' '}
            <Link to="/register" className="font-medium text-emerald-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
