import { AppRoutes } from '@/routes'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from 'sonner'

export function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          },
        }}
      />
    </ErrorBoundary>
  )
}
