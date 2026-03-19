import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--bg)]'>
        <span className='w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  return children
}
