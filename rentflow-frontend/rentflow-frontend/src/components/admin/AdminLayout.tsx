import type { ReactNode } from 'react'
import { LayoutGrid, Archive, Wallet, Settings, Plus, Users, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PortalLayout, { type NavItem } from '@/components/common/PortalLayout'

const NAV_ITEMS: NavItem[] = [
  {
    to: '/admin',
    label: 'Operations',
    icon: <LayoutGrid className="h-4 w-4" />,
    testId: 'nav-admin-operations',
  },
  {
    to: '/admin/bookings',
    label: 'Bookings & Rentals',
    icon: <Archive className="h-4 w-4" />,
    testId: 'nav-admin-bookings',
  },
  {
    to: '/admin/users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />,
    testId: 'nav-admin-users',
  },
  {
    to: '/admin/vendors',
    label: 'Vendor Approvals',
    icon: <ShieldCheck className="h-4 w-4" />,
    testId: 'nav-admin-vendors',
  },

  {
    to: '/admin/logistics',
    label: 'Logistics',
    icon: <Archive className="h-4 w-4" />,
    testId: 'nav-admin-logistics',
  },
  {
    to: '/admin/finance',
    label: 'Finance',
    icon: <Wallet className="h-4 w-4" />,
    testId: 'nav-admin-finance',
  },
  {
    to: '/admin/configuration',
    label: 'Configuration',
    icon: <Settings className="h-4 w-4" />,
    testId: 'nav-admin-configuration',
  },
]

export default function AdminLayout({
  children,
  pageTitle,
  pageDescription,
}: {
  children: ReactNode
  pageTitle: string
  pageDescription?: string
}) {
  const navigate = useNavigate()

  return (
    <PortalLayout
      navItems={NAV_ITEMS}
      brandLabel="Admin Backend"
      brandSubtitle="Main Branch"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      primaryAction={
        <button
          type="button"
          onClick={() => navigate('/browse')}
          data-testid="new-rental-button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rf-mint-500 py-2.5 text-sm font-semibold text-rf-navy-950 hover:bg-rf-mint-400"
        >
          <Plus className="h-4 w-4" /> New Rental
        </button>
      }
    >
      {children}
    </PortalLayout>
  )
}
