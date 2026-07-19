import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, Gauge, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: Boxes,
    title: 'Live inventory',
    body: 'Track every rented item across branches, from checkout to return, in one place.',
  },
  {
    icon: Gauge,
    title: 'Automated fees',
    body: 'Grace periods, hourly rates, and daily caps apply themselves — no manual math.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    body: 'Staff and customers each see exactly the tools built for their job.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-rf-cream-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-rf-navy-900" />
          <span className="font-display text-lg font-bold text-rf-navy-900">RentFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            data-testid="landing-login-link"
            className="rounded-lg px-4 py-2 text-sm font-medium text-rf-navy-900 hover:bg-white"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            data-testid="landing-register-link"
            className="rounded-lg bg-rf-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-widest text-emerald-700">
            RENTAL OPERATIONS, SIMPLIFIED
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-rf-navy-900 sm:text-5xl">
            One system for every rental, from reservation to return.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            RentFlow gives your staff a real-time operations console and gives customers a clean
            self-serve portal to book, track, and return equipment — all built on one backend.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-lg bg-rf-navy-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Create a customer account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-rf-navy-900 hover:bg-white"
            >
              Staff sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <f.icon className="h-6 w-6 text-rf-navy-800" />
              <h3 className="mt-4 font-display text-base font-semibold text-rf-navy-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
