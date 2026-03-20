import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LoadingScreen } from '@/components/effects/loading-screen'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  return children
}
