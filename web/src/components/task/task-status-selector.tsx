import type { TaskStatus } from '@/types/task'

interface TaskStatusSelectorProps {
  currentStatus: TaskStatus
  canChange: boolean
  isAdmin: boolean
  onStatusChange: (status: TaskStatus) => void
  onStatusChangeWithJustification: (status: TaskStatus) => void
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const allStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed']

export function TaskStatusSelector({
  currentStatus,
  canChange,
  isAdmin,
  onStatusChange,
  onStatusChangeWithJustification,
}: TaskStatusSelectorProps) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
        Status
      </p>
      {canChange ? (
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === currentStatus) return
                if (isAdmin) {
                  onStatusChange(s)
                } else {
                  onStatusChangeWithJustification(s)
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer
                ${
                  currentStatus === s
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-transparent border-white/[0.06] text-[var(--text-muted)] hover:border-white/[0.12]'
                }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 inline-block">
          {statusLabels[currentStatus]}
        </span>
      )}
    </div>
  )
}
