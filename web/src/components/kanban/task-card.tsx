import { useState } from 'react'
import type { Task, TaskStatus } from '@/types/task'
import { ChevronRight } from 'lucide-react'
import { JustificationModal } from '@/components/task/justification-modal'
import { UserAvatar } from '@/components/ui/user-avatar'

interface TaskCardProps {
  task: Task & { requests?: Array<{ status: string }> }
  onStatusChange: (taskId: string, status: TaskStatus, justification?: string) => void
  onSelect: (taskId: string) => void
  isAdmin?: boolean
}

const priorityStyles = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
}

const nextStatusLabel: Record<TaskStatus, string> = {
  pending: 'Iniciar',
  in_progress: 'Concluir',
  completed: '',
}

export function TaskCard({ task, onStatusChange, onSelect, isAdmin = false }: TaskCardProps) {
  const next = nextStatus[task.status]
  const canChangeStatus = true
  const hasPendingRequests = task.requests?.some((r) => r.status === 'pending')
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)

  function handleQuickStatusChange(e: React.MouseEvent, newStatus: TaskStatus) {
    e.stopPropagation()
    if (isAdmin) {
      onStatusChange(task.id, newStatus)
    } else {
      setPendingStatus(newStatus)
    }
  }

  return (
    <>
      <div
        onClick={() => onSelect(task.id)}
        className="rounded-xl p-3.5 border border-white/[0.06] hover:border-emerald-500/15 transition-all duration-200 group cursor-pointer relative"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
        }}
      >
        {hasPendingRequests && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm text-[var(--text)] leading-snug">{task.title}</p>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${priorityStyles[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {task.assignments?.filter(a => a.status === 'assigned').length > 0 && (
              <div className="flex items-center -space-x-1.5">
                {task.assignments
                  .filter(a => a.status === 'assigned')
                  .slice(0, 3)
                  .map((a) => (
                    <UserAvatar key={a.user.id} name={a.user.name} avatar={a.user.avatar} size="xs" userId={a.user.id} className="ring-offset-1 ring-offset-[rgb(8,12,10)]" />
                  ))}
                {task.assignments.filter(a => a.status === 'assigned').length > 3 && (
                  <span className="text-xs text-[var(--text-muted)] ml-1">
                    +{task.assignments.filter(a => a.status === 'assigned').length - 3}
                  </span>
                )}
              </div>
            )}
            <span
              className="text-xs text-[var(--text-muted)]"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              ORB-{task.id.slice(0, 4).toUpperCase()}
            </span>
          </div>

          {next && canChangeStatus && (
            <button
              onClick={(e) => handleQuickStatusChange(e, next)}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              {nextStatusLabel[task.status]}
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      <JustificationModal
        isOpen={pendingStatus !== null}
        newStatus={pendingStatus ?? ''}
        onConfirm={(justification) => {
          if (pendingStatus) {
            onStatusChange(task.id, pendingStatus, justification)
          }
          setPendingStatus(null)
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  )
}
