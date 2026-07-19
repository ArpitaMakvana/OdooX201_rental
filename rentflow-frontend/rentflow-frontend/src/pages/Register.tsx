import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Register() {
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (password !== confirm) {
      setLocalError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      await register({ name, email, password, role: 'user' })
      navigate('/dashboard', { replace: true })
    } catch {
      // surfaced via context `error`
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rf-navy-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <ShieldCheck className="mb-3 h-9 w-9 text-rf-mint-400" />
          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-1 text-xs tracking-widest text-slate-400">RENTFLOW CUSTOMER PORTAL</p>
        </div>

        <div className="rounded-2xl bg-rf-cream-50 p-8 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit} data-testid="register-form">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Full name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="register-name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="register-email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="register-password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                data-testid="register-confirm"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-rf-navy-900 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>

            {(localError || error) && (
              <p
                role="alert"
                data-testid="register-error"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200"
              >
                {localError ?? error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="register-submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rf-navy-900 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
              <UserPlus className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
