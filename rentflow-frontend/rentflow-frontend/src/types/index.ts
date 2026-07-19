export type Role = 'user' | 'admin' | 'vendor'

export type AccountStatus = 'pending' | 'active' | 'rejected' | 'suspended'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: AccountStatus
  branch?: string
  avatarUrl?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export type RentalStatus = 'pending' | 'rejected' | 'cancelled' | 'active' | 'reserved' | 'delivered' | 'returned' | 'overdue' | 'completed'

export interface Rental {
  id: string
  itemName: string
  category: string
  branch: string
  dailyRate: number
  status: RentalStatus
  startDate: string
  dueDate: string
  returnedDate?: string
  lateFee?: number
}

export interface ApiError {
  status: number
  message: string
}

export interface LateFeePolicy {
  gracePeriodMinutes: number
  hourlyRate: number
  dailyMaxLimit: number
  roundingLogic: 'nearest_hour' | 'nearest_15' | 'exact'
  autoLockAtAmount: number
  autoLockEnabled: boolean
  legalAutoDraftEnabled: boolean
}
