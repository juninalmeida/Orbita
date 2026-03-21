import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/helpers/render'
import { LoginPage } from '../login'

const mockLogin = vi.fn()
const mockGetMe = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/api/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getMe: () => mockGetMe(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('shows link to register page', () => {
    renderWithProviders(<LoginPage />)

    const link = screen.getByRole('link', { name: 'Criar conta' })
    expect(link).toHaveAttribute('href', '/register')
  })

  it('does not submit with invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'not-a-valid-email')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'test@email.com')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login API on valid submit', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ message: 'ok' })
    mockGetMe.mockResolvedValue({ id: '1', role: 'member' })

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'test@email.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@email.com', '123456')
    })
  })

  it('navigates to /admin for admin users', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    mockLogin.mockResolvedValue({ message: 'ok' })
    mockGetMe.mockResolvedValue({ id: '1', role: 'admin' })

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'admin@email.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await vi.advanceTimersByTimeAsync(700)

    expect(mockNavigate).toHaveBeenCalledWith('/admin')

    vi.useRealTimers()
  })

  it('navigates to /dashboard for member users', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    mockLogin.mockResolvedValue({ message: 'ok' })
    mockGetMe.mockResolvedValue({ id: '1', role: 'member' })

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'user@email.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await vi.advanceTimersByTimeAsync(700)

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')

    vi.useRealTimers()
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Unauthorized'))

    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText('E-mail'), 'wrong@email.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos')).toBeInTheDocument()
    })
  })
})
