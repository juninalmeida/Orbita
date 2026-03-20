import { Plus } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onAddTask: () => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-[var(--text-muted)]',
  in_progress: 'bg-[var(--warning)]',
  completed: 'bg-[var(--success)]',
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onStatusChange,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <span
            className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {title}
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  )
}
