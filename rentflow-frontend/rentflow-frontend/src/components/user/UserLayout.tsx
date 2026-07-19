import type { ReactNode } from 'react'
import { LayoutDashboard, ListChecks, Search, UserRound } from 'lucide-react'
import PortalLayout, { type NavItem } from '@/components/common/PortalLayout'

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    testId: 'nav-user-dashboard',
  },
  {
    to: '/browse',
    label: 'Browse Rentals',
    icon: <Search className="h-4 w-4" />,
    testId: 'nav-user-browse',
  },
  {
    to: '/my-rentals',
    label: 'My Rentals',
    icon: <ListChecks className="h-4 w-4" />,
    testId: 'nav-user-my-rentals',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: <UserRound className="h-4 w-4" />,
    testId: 'nav-user-profile',
  },
]

export default function UserLayout({
  children,
  pageTitle,
  pageDescription,
}: {
  children: ReactNode
  pageTitle: string
  pageDescription?: string
}) {
  return (
    <PortalLayout
      navItems={NAV_ITEMS}
      brandLabel="RentFlow"
      brandSubtitle="Customer Portal"
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    >
      {children}
    </PortalLayout>
  )
}
