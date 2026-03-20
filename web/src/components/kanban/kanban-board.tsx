import { useState } from 'react'
import type { Task, TaskStatus } from '@/types/task'
import { useTasks } from '@/hooks/use-tasks'
import { KanbanColumn } from './kanban-column'
import { CreateTaskDrawer } from './create-task-drawer'
import { TaskDetailModal } from '@/components/task/task-detail-modal'

interface KanbanBoardProps {
  teamId: string
  isAdmin?: boolean
  adminTasks?: Task[]
  adminIsLoading?: boolean
  adminChangeStatus?: (args: { taskId: string; status: string; justification?: string }) => void
  onAdminTaskDeleted?: () => void
  onAdminTaskArchived?: () => void
}

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Pendente', status: 'pending' },
  { title: 'Em andamento', status: 'in_progress' },
  { title: 'Concluído', status: 'completed' },
]

export function KanbanBoard({
  teamId,
  isAdmin = false,
  adminTasks,
  adminIsLoading,
  adminChangeStatus,
  onAdminTaskDeleted,
  onAdminTaskArchived,
}: KanbanBoardProps) {
  const memberHook = useTasks(teamId)
  const tasks = adminTasks ?? memberHook.tasks
  const isLoading = adminIsLoading ?? memberHook.isLoading
  const changeStatus = adminChangeStatus ?? memberHook.changeStatus

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

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
            onAddTask={col.status === 'pending' ? () => setIsDrawerOpen(true) : undefined}
            onStatusChange={(taskId, status, justification) =>
              changeStatus({ taskId, status, justification })
            }
            onSelect={(taskId) => setSelectedTaskId(taskId)}
            isAdmin={isAdmin}
            collapsible={col.status !== 'pending'}
          />
        ))}
      </div>

      <CreateTaskDrawer
        teamId={teamId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => {
          setSelectedTaskId(null)
        }}
        isAdmin={isAdmin}
        teamId={teamId}
        onDeleted={() => {
          setSelectedTaskId(null)
          onAdminTaskDeleted?.()
        }}
        onArchived={() => {
          setSelectedTaskId(null)
          onAdminTaskArchived?.()
        }}
      />
    </>
  )
}
