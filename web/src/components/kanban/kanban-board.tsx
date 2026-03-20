import { useState } from 'react'
import type { TaskStatus } from '@/types/task'
import { useTasks } from '@/hooks/use-tasks'
import { KanbanColumn } from './kanban-column'
import { CreateTaskDrawer } from './create-task-drawer'

interface KanbanBoardProps {
  teamId: string
}

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Pendente', status: 'pending' },
  { title: 'Em andamento', status: 'in_progress' },
  { title: 'Concluído', status: 'completed' },
]

export function KanbanBoard({ teamId }: KanbanBoardProps) {
  const { tasks, isLoading, changeStatus } = useTasks(teamId)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex gap-6">
        {columns.map((col) => (
          <div key={col.status} className="w-72 flex-shrink-0">
            <div className="h-5 w-24 rounded bg-[var(--card)] animate-pulse mb-3" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-[var(--card)] animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasks.filter((t) => t.status === col.status)}
            onAddTask={() => setIsDrawerOpen(true)}
            onStatusChange={(taskId, status) =>
              changeStatus({ taskId, status })
            }
          />
        ))}
      </div>

      <CreateTaskDrawer
        teamId={teamId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  )
}
