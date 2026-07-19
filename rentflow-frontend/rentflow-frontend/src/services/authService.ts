import api from './api'
import { delay, MOCK_USERS, USE_MOCKS } from './mockData'
import type { AuthResponse, Role, User } from '@/types'

export interface LoginPayload {
  branch: string
  identifier: string // employee ID / email
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
}

const SESSION_KEY = 'rentflow.session' // in-memory only; see AuthContext for details

async function mockLogin({ identifier, password }: LoginPayload): Promise<AuthResponse> {
  const match = MOCK_USERS.find(
    (u) => (u.email === identifier || u.id === identifier) && u.password === password,
  )
  if (!match) {
    const err = new Error('Invalid credentials') as Error & { status?: number }
    err.status = 401
    throw err
  }
  if (match.status === 'suspended') {
    const err = new Error('This account has been suspended. Contact IT support.') as Error & {
      status?: number
    }
    err.status = 403
    throw err
  }
  const { password: _pw, ...user } = match
  return delay({ user, token: `mock-token-${user.id}` })
}

async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
  const exists = MOCK_USERS.some((u) => u.email === payload.email)
  if (exists) {
    const err = new Error('An account with this email already exists.') as Error & {
      status?: number
    }
    err.status = 409
    throw err
  }
  const user: User = {
    id: `usr_${Date.now()}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    branch: 'main-branch',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  MOCK_USERS.push({ ...user, password: payload.password })
  return delay({ user, token: `mock-token-${user.id}` })
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCKS) return mockLogin(payload)
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_MOCKS) return mockRegister(payload)
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) {
      await delay(undefined, 150)
      return
    }
    await api.post('/auth/logout')
  },

  /** Called on app load to re-hydrate the session from the httpOnly cookie. */
  async getSession(): Promise<User | null> {
    if (USE_MOCKS) return null // mocks rely on the persisted context state instead
    try {
      const { data } = await api.get<User>('/auth/session')
      return data
    } catch {
      return null
    }
  },

  SESSION_KEY,
}
