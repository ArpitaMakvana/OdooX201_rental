import type { ReactNode } from 'react'
import { LayoutGrid, Package, BookOpen, Wallet, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PortalLayout, { type NavItem } from '@/components/common/PortalLayout'

const NAV_ITEMS: NavItem[] = [
  {
    to: '/vendor',
    label: 'Dashboard',
    icon: <LayoutGrid className="h-4 w-4" />,
    testId: 'nav-vendor-dashboard',
  },
  {
    to: '/vendor/bookings',
    label: 'Bookings',
    icon: <BookOpen className="h-4 w-4" />,
    testId: 'nav-vendor-bookings',
  },
  {
    to: '/vendor/equipment',
    label: 'My Equipment',
    icon: <Package className="h-4 w-4" />,
    testId: 'nav-vendor-equipment',
  },
  {
    to: '/vendor/earnings',
    label: 'Earnings',
    icon: <Wallet className="h-4 w-4" />,
    testId: 'nav-vendor-earnings',
  },
]

export default function VendorLayout({
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
      brandLabel="Vendor Portal"
      brandSubtitle="RentFlow"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      primaryAction={
        <button
          type="button"
          onClick={() => navigate('/vendor/equipment')}
          data-testid="add-equipment-button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rf-mint-500 py-2.5 text-sm font-semibold text-rf-navy-950 hover:bg-rf-mint-400"
        >
          <Plus className="h-4 w-4" /> Add Equipment
        </button>
      }
    >
      {children}
    </PortalLayout>
  )
}
