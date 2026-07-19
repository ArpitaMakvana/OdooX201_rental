import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, HelpCircle, Search, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  testId: string
}

interface PortalLayoutProps {
  navItems: NavItem[]
  brandLabel: string
  brandSubtitle: string
  primaryAction?: ReactNode
  children: ReactNode
  pageTitle: string
  pageDescription?: string
  topBarExtra?: ReactNode
}

export default function PortalLayout({
  navItems,
  brandLabel,
  brandSubtitle,
  primaryAction,
  children,
  pageTitle,
  pageDescription,
  topBarExtra,
}: PortalLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-rf-cream-100">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-rf-navy-900 px-4 py-6 text-white">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Shield className="h-6 w-6 text-rf-mint-400" strokeWidth={2} />
          <div>
            <p className="font-display text-lg font-bold leading-tight">{brandLabel}</p>
            <p className="text-xs text-slate-400">{brandSubtitle}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rf-navy-800 text-white'
                    : 'text-slate-300 hover:bg-rf-navy-800/60 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {primaryAction && <div className="mt-4">{primaryAction}</div>}

        <div className="mt-6 space-y-1 border-t border-rf-navy-700 pt-4">
          <a
            href="#support"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-rf-navy-800/60 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
            Support
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            data-testid="logout-button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-rf-navy-800/60 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-rf-cream-100 bg-white px-6 py-3">
          <label className="relative flex w-full max-w-sm items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search settings…"
              aria-label="Search"
              className="w-full rounded-lg bg-rf-cream-100 py-2 pl-9 pr-3 text-sm text-rf-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
            />
          </label>

          <div className="flex items-center gap-4">
            {topBarExtra}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-rf-navy-900 text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {user?.name?.charAt(0) ?? '?'}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-rf-navy-900">{user?.name}</p>
                <p className="text-xs capitalize leading-tight text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-rf-navy-900">{pageTitle}</h1>
            {pageDescription && <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
