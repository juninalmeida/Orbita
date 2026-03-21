import { screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '@/tests/helpers/render'
import { ProtectedRoute, AdminRoute } from '../protected-route'

// Mock useAuth to control auth state
const mockUseAuth = vi.fn()
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRoutes(
  guardElement: React.ReactElement,
  initialRoute: string = '/',
) {
  return renderWithProviders(
    <Routes>
      <Route element={guardElement}>
        <Route index element={<div>Protected Content</div>} />
      </Route>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
    </Routes>,
    { routerProps: { initialEntries: [initialRoute] } },
  )
}

describe('ProtectedRoute', () => {
  it('shows loading screen while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: undefined, isLoading: true })
    renderWithRoutes(<ProtectedRoute />)

    expect(screen.getByText('Orbita')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    renderWithRoutes(<ProtectedRoute />)

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Junior', role: 'member' },
      isLoading: false,
    })
    renderWithRoutes(<ProtectedRoute />)

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('redirects member to /dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Junior', role: 'member' },
      isLoading: false,
    })
    renderWithRoutes(<AdminRoute />)

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders outlet for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Admin', role: 'admin' },
      isLoading: false,
    })
    renderWithRoutes(<AdminRoute />)

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    renderWithRoutes(<AdminRoute />)

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
