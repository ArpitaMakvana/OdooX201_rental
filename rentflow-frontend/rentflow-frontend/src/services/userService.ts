import api from './api'
import { delay, MOCK_USERS, USE_MOCKS } from './mockData'
import type { AccountStatus, Role, User } from '@/types'

export const userService = {
  async list(): Promise<User[]> {
    if (USE_MOCKS) return delay(MOCK_USERS.map(({ password: _pw, ...u }) => u))
    const { data } = await api.get<User[]>('/admin/users')
    return data
  },

  async updateRole(userId: string, role: Role): Promise<User> {
    if (USE_MOCKS) {
      const target = MOCK_USERS.find((u) => u.id === userId)
      if (!target) throw new Error('User not found')
      target.role = role
      const { password: _pw, ...user } = target
      return delay(user, 250)
    }
    const { data } = await api.patch<User>(`/admin/users/${userId}/role`, { role })
    return data
  },

  async updateStatus(userId: string, status: AccountStatus): Promise<User> {
    if (USE_MOCKS) {
      const target = MOCK_USERS.find((u) => u.id === userId)
      if (!target) throw new Error('User not found')
      target.status = status
      const { password: _pw, ...user } = target
      return delay(user, 250)
    }
    const { data } = await api.patch<User>(`/admin/users/${userId}/status`, { status })
    return data
  },

  async remove(userId: string): Promise<void> {
    if (USE_MOCKS) {
      const idx = MOCK_USERS.findIndex((u) => u.id === userId)
      if (idx >= 0) MOCK_USERS.splice(idx, 1)
      return delay(undefined, 250)
    }
    await api.delete(`/admin/users/${userId}`)
  },

  async updateProfile(userId: string, patch: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    if (USE_MOCKS) {
      const target = MOCK_USERS.find((u) => u.id === userId)
      if (!target) throw new Error('User not found')
      Object.assign(target, patch)
      const { password: _pw, ...user } = target
      return delay(user, 250)
    }
    const { data } = await api.patch<User>(`/users/${userId}`, patch)
    return data
  },
}
