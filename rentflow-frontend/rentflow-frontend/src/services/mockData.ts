import type { LateFeePolicy, Rental, User } from '@/types'

/**
 * Demo/testing backend.
 *
 * The real integration point is `src/services/api.ts`, which talks to the
 * Express + Prisma backend over REST. Setting VITE_USE_MOCKS=false (see
 * .env.example) switches every service in `src/services/*Service.ts` over
 * to that real client — nothing else in the app needs to change.
 */

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'usr_admin_01',
    name: 'Priya Sharma',
    email: 'admin@rentflow.io',
    password: 'admin123',
    role: 'admin',
    branch: 'main-branch',
    status: 'active',
    createdAt: '2024-01-12T09:00:00Z',
  },
  {
    id: 'usr_customer_01',
    name: 'Devon Carter',
    email: 'devon@example.com',
    password: 'user123',
    role: 'user',
    branch: 'gandhinagar',
    status: 'active',
    createdAt: '2024-03-02T11:30:00Z',
  },
  {
    id: 'usr_customer_02',
    name: 'Maria Alvarez',
    email: 'maria@example.com',
    password: 'user123',
    role: 'user',
    branch: 'ahmedabad',
    status: 'suspended',
    createdAt: '2024-04-18T15:12:00Z',
  },
  {
    id: 'usr_customer_03',
    name: 'Tom Nakamura',
    email: 'tom@example.com',
    password: 'user123',
    role: 'user',
    branch: 'main-branch',
    status: 'active',
    createdAt: '2024-05-27T08:40:00Z',
  },
]

export const BRANCHES = [
  { id: 'main-branch', label: 'Main Branch — HQ' },
  { id: 'gandhinagar', label: 'Gandhinagar' },
  { id: 'ahmedabad', label: 'Ahmedabad' },
]

export const MOCK_RENTALS: Rental[] = [
  {
    id: 'rnt_1001',
    itemName: 'Canon EOS R6 Camera Kit',
    category: 'Photography',
    branch: 'gandhinagar',
    dailyRate: 40,
    status: 'active',
    startDate: '2026-07-10',
    dueDate: '2026-07-20',
  },
  {
    id: 'rnt_1002',
    itemName: 'DeWalt Power Tool Set',
    category: 'Tools',
    branch: 'gandhinagar',
    dailyRate: 15,
    status: 'overdue',
    startDate: '2026-06-28',
    dueDate: '2026-07-08',
    lateFee: 45,
  },
  {
    id: 'rnt_1003',
    itemName: '20ft Cargo Van',
    category: 'Vehicles',
    branch: 'main-branch',
    dailyRate: 89,
    status: 'reserved',
    startDate: '2026-07-25',
    dueDate: '2026-07-27',
  },
  {
    id: 'rnt_1004',
    itemName: 'Party Tent (30x30)',
    category: 'Events',
    branch: 'ahmedabad',
    dailyRate: 120,
    status: 'returned',
    startDate: '2026-06-01',
    dueDate: '2026-06-04',
    returnedDate: '2026-06-04',
  },
]

export const DEFAULT_LATE_FEE_POLICY: LateFeePolicy = {
  gracePeriodMinutes: 30,
  hourlyRate: 15,
  dailyMaxLimit: 250,
  roundingLogic: 'nearest_hour',
  autoLockAtAmount: 500,
  autoLockEnabled: true,
  legalAutoDraftEnabled: false,
}

/** Small helper to simulate realistic network latency in the mock layer. */
export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'
