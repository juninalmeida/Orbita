import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskCard } from '../task-card'
import { renderWithProviders } from '@/tests/helpers/render'
import type { Task } from '@/types/task'

const baseTask: Task & { requests?: Array<{ status: string }> } = {
  id: 'abcd1234-0000-0000-0000-000000000000',
  title: 'Implementar autenticação',
  description: 'Adicionar login com JWT e cookies httpOnly',
  status: 'pending',
  priority: 'high',
  teamId: 'team-1',
  assignments: [
    {
      id: 'a1',
      user: { id: 'u1', name: 'Junior', email: 'j@test.com' },
      role: 'owner',
      status: 'assigned',
    },
  ],
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-15T00:00:00Z',
  archived: false,
  archivedAt: null,
}

const defaultProps = {
  onStatusChange: vi.fn(),
  onSelect: vi.fn(),
}

describe('TaskCard', () => {
  it('renders task title and priority', () => {
    renderWithProviders(<TaskCard task={baseTask} {...defaultProps} />)

    expect(screen.getByText('Implementar autenticação')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders description when present', () => {
    renderWithProviders(<TaskCard task={baseTask} {...defaultProps} />)
    expect(
      screen.getByText('Adicionar login com JWT e cookies httpOnly'),
    ).toBeInTheDocument()
  })

  it('does not render description when null', () => {
    const taskNoDesc = { ...baseTask, description: null }
    renderWithProviders(<TaskCard task={taskNoDesc} {...defaultProps} />)

    expect(
      screen.queryByText('Adicionar login com JWT e cookies httpOnly'),
    ).not.toBeInTheDocument()
  })

  it('shows task ID in ORB-XXXX format', () => {
    renderWithProviders(<TaskCard task={baseTask} {...defaultProps} />)
    expect(screen.getByText('ORB-ABCD')).toBeInTheDocument()
  })

  it('calls onSelect with task id when card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithProviders(
      <TaskCard task={baseTask} {...defaultProps} onSelect={onSelect} />,
    )
    await user.click(screen.getByText('Implementar autenticação'))

    expect(onSelect).toHaveBeenCalledWith(baseTask.id)
  })

  it('shows quick status change button for pending tasks', () => {
    renderWithProviders(<TaskCard task={baseTask} {...defaultProps} />)
    expect(screen.getByText('Iniciar')).toBeInTheDocument()
  })

  it('shows Concluir button for in_progress tasks', () => {
    const inProgressTask = { ...baseTask, status: 'in_progress' as const }
    renderWithProviders(<TaskCard task={inProgressTask} {...defaultProps} />)
    expect(screen.getByText('Concluir')).toBeInTheDocument()
  })

  it('does not show status button for completed tasks', () => {
    const completedTask = { ...baseTask, status: 'completed' as const }
    renderWithProviders(<TaskCard task={completedTask} {...defaultProps} />)

    expect(screen.queryByText('Iniciar')).not.toBeInTheDocument()
    expect(screen.queryByText('Concluir')).not.toBeInTheDocument()
  })

  it('admin: calls onStatusChange directly without justification modal', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()

    renderWithProviders(
      <TaskCard
        task={baseTask}
        onSelect={vi.fn()}
        onStatusChange={onStatusChange}
        isAdmin
      />,
    )

    await user.click(screen.getByText('Iniciar'))
    expect(onStatusChange).toHaveBeenCalledWith(baseTask.id, 'in_progress')
  })

  it('member: opens justification modal on status change', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TaskCard task={baseTask} {...defaultProps} isAdmin={false} />,
    )

    await user.click(screen.getByText('Iniciar'))

    // Modal should appear
    expect(screen.getByText('Justificativa de alteração')).toBeInTheDocument()
  })

  it('shows pending requests indicator', () => {
    const taskWithRequests = {
      ...baseTask,
      requests: [{ status: 'pending' }],
    }
    const { container } = renderWithProviders(
      <TaskCard task={taskWithRequests} {...defaultProps} />,
    )

    expect(container.querySelector('.bg-amber-400')).toBeInTheDocument()
  })
})
