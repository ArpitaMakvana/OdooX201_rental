import api from './api'
import { DEFAULT_LATE_FEE_POLICY, delay, MOCK_RENTALS, USE_MOCKS } from './mockData'
import type { LateFeePolicy, Rental } from '@/types'

let policyState: LateFeePolicy = { ...DEFAULT_LATE_FEE_POLICY }

export const rentalService = {
  async listMine(): Promise<Rental[]> {
    if (USE_MOCKS) return delay(MOCK_RENTALS)
    const { data } = await api.get<Rental[]>('/rentals/mine')
    return data
  },

  async browseAvailable(filters: Record<string, string> = {}): Promise<Rental[]> {
    if (USE_MOCKS) return delay(MOCK_RENTALS.filter((r) => r.status !== 'active'))
    
    // Clean empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    )
    const params = new URLSearchParams(cleanFilters).toString()
    const { data } = await api.get<Rental[]>(`/rentals/available${params ? `?${params}` : ''}`)
    return data
  },

  async requestRental(itemId: string): Promise<Rental> {
    if (USE_MOCKS) {
      const item = MOCK_RENTALS.find((r) => r.id === itemId)
      if (!item) throw new Error('Item not found')
      item.status = 'reserved'
      return delay(item, 300)
    }
    const { data } = await api.post<Rental>(`/rentals/${itemId}/request`)
    return data
  },

  async updateStatus(rentalId: string, status: string): Promise<any> {
    const { data } = await api.put(`/rentals/${rentalId}/status`, { status });
    return data;
  }
}

export const configService = {
  async getLateFeePolicy(): Promise<LateFeePolicy> {
    if (USE_MOCKS) return delay({ ...policyState })
    const { data } = await api.get<LateFeePolicy>('/admin/config/late-fees')
    return data
  },

  async saveLateFeePolicy(policy: LateFeePolicy): Promise<LateFeePolicy> {
    if (USE_MOCKS) {
      policyState = { ...policy }
      return delay({ ...policyState }, 400)
    }
    const { data } = await api.put<LateFeePolicy>('/admin/config/late-fees', policy)
    return data
  },
}
