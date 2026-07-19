import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerAuthErrorHandlers } from '@/services/api'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/authService'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// NOTE: state lives in memory only for this session (React state), matching
// the artifact/browser-storage constraint. In the real deployment the
// session of record is the backend's httpOnly JWT cookie — this local
// `user` object is just a UI-convenience mirror of it, re-derived from
// GET /auth/session on load (see authService.getSession).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    registerAuthErrorHandlers({
      onUnauthorized: () => {
        setUser(null)
        setStatus('unauthenticated')
        navigate('/login', { replace: true })
      },
      onForbidden: () => {
        navigate('/403', { replace: true })
      },
    })
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    authService.getSession().then((sessionUser) => {
      if (cancelled) return
      setUser(sessionUser)
      setStatus(sessionUser ? 'authenticated' : 'unauthenticated')
    })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null)
    setStatus('loading')
    try {
      const { user: loggedInUser } = await authService.login(payload)
      setUser(loggedInUser)
      setStatus('authenticated')
      return loggedInUser
    } catch (err) {
      setStatus('unauthenticated')
      const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null)
    setStatus('loading')
    try {
      const { user: newUser } = await authService.register(payload)
      setUser(newUser)
      setStatus('authenticated')
      return newUser
    } catch (err) {
      setStatus('unauthenticated')
      const message = err instanceof Error ? err.message : 'Unable to create your account.'
      setError(message)
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ user, status, error, login, register, logout, clearError }),
    [user, status, error, login, register, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
