import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { ProtectedRoute } from '@/components/protected-route'
import { Layout } from '@/components/layout/layout'
import { DashboardPage } from '@/pages/dashboard'

export function AppRoutes() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path='/dashboard' element={<DashboardPage />} />
      </Route>
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  )
}