import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetricCard } from '../metric-card'
import { Users } from 'lucide-react'

describe('MetricCard', () => {
  it('renders label and numeric value', () => {
    render(<MetricCard icon={Users} label="Membros" value={42} />)

    expect(screen.getByText('Membros')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders string value', () => {
    render(<MetricCard icon={Users} label="Taxa" value="87%" />)
    expect(screen.getByText('87%')).toBeInTheDocument()
  })

  it('renders suffix when provided', () => {
    render(<MetricCard icon={Users} label="Tasks" value={15} suffix="ativas" />)
    expect(screen.getByText('ativas')).toBeInTheDocument()
  })

  it('does not render suffix when not provided', () => {
    const { container } = render(
      <MetricCard icon={Users} label="Teams" value={3} />,
    )
    const suffixSpan = container.querySelector('.text-sm.text-\\[var\\(--text-muted\\)\\]')
    expect(suffixSpan).not.toBeInTheDocument()
  })
})
