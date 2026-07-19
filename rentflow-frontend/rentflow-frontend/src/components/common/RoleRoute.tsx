import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'
import ProtectedRoute from './ProtectedRoute'

/**
 * Wraps ProtectedRoute with a role check. A signed-in Standard User hitting
 * an Admin-only route is redirected to the 403 page rather than their
 * dashboard, per the RBAC spec — this keeps the "you don't have access"
 * signal explicit instead of silently rerouting them.
 */
export default function RoleRoute({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      {user && !allow.includes(user.role) ? <Navigate to="/403" replace /> : children}
    </ProtectedRoute>
  )
}
