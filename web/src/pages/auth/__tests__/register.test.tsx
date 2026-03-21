import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/helpers/render'
import { RegisterPage } from '../register'

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/api/auth', () => ({
  register: (...args: unknown[]) => mockRegister(...args),
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

const validData = {
  name: 'Junior Almeida',
  email: 'junior@email.com',
  password: 'Test1234',
}

describe('RegisterPage', () => {
  it('renders name, email, and password fields', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
  })

  it('shows link to login page', () => {
    renderWithProviders(<RegisterPage />)

    const link = screen.getByRole('link', { name: 'Entrar' })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('validates name minimum length', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), 'A')
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), validData.password)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Mínimo 2 caracteres')).toBeInTheDocument()
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('does not submit with invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), 'not-a-valid-email')
    await user.type(screen.getByLabelText('Senha'), validData.password)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  it('validates password requires minimum 8 chars', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), 'Ab1')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
    })
  })

  it('validates password requires uppercase letter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), 'abcdefg1')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Deve conter uma letra maiúscula')).toBeInTheDocument()
    })
  })

  it('validates password requires number', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), 'Abcdefgh')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('Deve conter um número')).toBeInTheDocument()
    })
  })

  it('calls register API and navigates to /login on success', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ id: '1' })

    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), validData.password)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        validData.name,
        validData.email,
        validData.password,
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows API error message on failure', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValue({
      response: { data: { message: 'E-mail já cadastrado' } },
    })

    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), validData.password)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(screen.getByText('E-mail já cadastrado')).toBeInTheDocument()
    })
  })

  it('shows default error when API gives no message', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValue(new Error('Network error'))

    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText('Nome'), validData.name)
    await user.type(screen.getByLabelText('E-mail'), validData.email)
    await user.type(screen.getByLabelText('Senha'), validData.password)
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao criar conta. Tente novamente.'),
      ).toBeInTheDocument()
    })
  })
})
