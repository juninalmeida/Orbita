import { AppRoutes } from '@/routes'
import { Toaster } from 'sonner'

export function App() {
  return (
    <>
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
    </>
  )
}
