import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Central API client for the Express/Prisma backend.
 *
 * - Base URL comes from VITE_API_BASE_URL (see .env.example).
 * - `withCredentials: true` so the httpOnly JWT cookie set by the backend
 *   is sent automatically; no token is ever stored in localStorage.
 * - A response interceptor centralizes 401/403 handling so individual
 *   pages/components don't need to repeat that logic.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

type UnauthorizedHandler = () => void
type ForbiddenHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null
let onForbidden: ForbiddenHandler | null = null

/** Wired up once from AuthContext so the interceptor can trigger logout/redirects. */
export function registerAuthErrorHandlers(handlers: {
  onUnauthorized: UnauthorizedHandler
  onForbidden: ForbiddenHandler
}) {
  onUnauthorized = handlers.onUnauthorized
  onForbidden = handlers.onForbidden
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => config)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      // Session missing/expired — clear local auth state and send to /login
      onUnauthorized?.()
    }

    if (status === 403) {
      // Authenticated but not permitted — surface a 403 page instead of a dead request
      onForbidden?.()
    }

    return Promise.reject(error)
  },
)

export default api
