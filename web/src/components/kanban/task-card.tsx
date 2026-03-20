import type { Task, TaskStatus } from '@/types/task'
import { ChevronRight } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onSelect: (taskId: string) => void
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

export function TaskCard({ task, onStatusChange, onSelect }: TaskCardProps) {
  const next = nextStatus[task.status]

  return (
    <div
      onClick={() => onSelect(task.id)}
      className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--border-hover)] transition-all duration-200 group cursor-pointer"
    >
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
          {task.assignedTo && (
            <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-semibold text-white">
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className="text-xs text-[var(--text-muted)]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            ORB-{task.id.slice(0, 4).toUpperCase()}
          </span>
        </div>

        {next && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(task.id, next)
            }}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            {nextStatusLabel[task.status]}
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
