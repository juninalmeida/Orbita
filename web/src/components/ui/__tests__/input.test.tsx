import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Input } from '../input'

describe('Input', () => {
  it('renders without label or error', () => {
    render(<Input placeholder="Digite aqui" />)
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument()
  })

  it('renders label linked to input via id', () => {
    render(<Input label="E-mail" id="email" />)

    const label = screen.getByText('E-mail')
    const input = screen.getByLabelText('E-mail')

    expect(label).toHaveAttribute('for', 'email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('does not render label when not provided', () => {
    render(<Input id="name" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('shows error message with danger styling', () => {
    render(<Input error="Campo obrigatório" />)

    const error = screen.getByText('Campo obrigatório')
    expect(error).toBeInTheDocument()
    expect(error).toHaveClass('text-[var(--danger)]')
  })

  it('applies error border class when error is present', () => {
    render(<Input error="Inválido" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('border-[var(--danger)]')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Nome" />)

    const input = screen.getByPlaceholderText('Nome')
    await user.type(input, 'Orbita')

    expect(input).toHaveValue('Orbita')
  })

  it('passes through HTML attributes', () => {
    render(<Input type="password" required data-testid="pw" />)

    const input = screen.getByTestId('pw')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toBeRequired()
  })
})
