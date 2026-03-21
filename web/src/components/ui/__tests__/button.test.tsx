import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-700/80')
  })

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Cancel</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
  })

  it('shows spinner and disables when loading', () => {
    render(<Button isLoading>Saving</Button>)
    const btn = screen.getByRole('button')

    expect(btn).toBeDisabled()
    expect(screen.queryByText('Saving')).not.toBeInTheDocument()
    expect(btn.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Go</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick handler', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Go</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button disabled onClick={handleClick}>Go</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
