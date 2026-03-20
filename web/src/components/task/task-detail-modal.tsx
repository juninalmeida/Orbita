import { X } from 'lucide-react'
import { useTaskDetail } from '@/hooks/use-task-detail'
import { HistoryTimeline } from './history-timeline'
import type { TaskStatus } from '@/types/task'

interface TaskDetailModalProps {
  taskId: string | null
  onClose: () => void
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

const priorityStyles = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

const allStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed']

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { task, history, isLoadingTask, changeStatus } = useTaskDetail(taskId)

  if (!taskId) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <span
            className="text-xs font-mono text-[var(--text-muted)]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            ORB-{taskId.slice(0, 4).toUpperCase()}
          </span>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {isLoadingTask ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            <div>
              <h2
                className="text-base font-semibold text-[var(--text)] mb-1"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {task.title}
              </h2>
              {task.description && (
                <p className="text-sm text-[var(--text-muted)]">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </span>
              {task.assignedTo && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-semibold text-white">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {task.assignedTo.name}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Status
              </p>
              <div className="flex gap-2">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => s !== task.status && changeStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer
                      ${
                        task.status === s
                          ? 'bg-[var(--primary-glow)] border-[var(--primary)]/30 text-[var(--primary)]'
                          : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                      }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                Histórico
              </p>
              <HistoryTimeline history={history} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
