import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onAddTask?: () => void
  onStatusChange: (taskId: string, status: TaskStatus, justification?: string) => void
  onSelect: (taskId: string) => void
  isAdmin?: boolean
  collapsible?: boolean
}

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-[var(--text-muted)]',
  in_progress: 'bg-[var(--warning)]',
  completed: 'bg-emerald-500',
}

const statusGlow: Record<TaskStatus, string> = {
  pending: '',
  in_progress: 'shadow-[0_0_6px_var(--warning)]',
  completed: 'shadow-[0_0_6px_rgba(16,185,129,0.6)]',
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onStatusChange,
  onSelect,
  isAdmin = false,
  collapsible = false,
}: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [tasks])

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]} ${statusGlow[status]}`} />
          <span
            className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {title}
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-white/[0.05] px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[var(--text-muted)] hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="text-[var(--text-muted)] hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Plus size={15} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        className="flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: collapsed ? 0 : contentHeight ?? 'none',
          opacity: collapsed ? 0 : 1,
        }}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onSelect={onSelect}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  )
}
