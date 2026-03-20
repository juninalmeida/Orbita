import { useState } from 'react'
import { useArchivedTasks, useDeletedTasks, useAdminOverview } from '@/hooks/use-admin'
import { toast } from 'sonner'
import type { TaskStatus, TaskPriority } from '@/types/task'
import { X } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

const priorityStyles: Record<TaskPriority, string> = {
  high: 'text-rose-400 bg-rose-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-slate-400 bg-slate-400/10',
}

const priorityLabels: Record<TaskPriority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

type TabFilter = 'archived' | 'deleted'

interface ArchivedTask {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  archivedAt: string | null
  deletedAt?: string | null
  team?: { id: string; name: string }
  assignee?: { id: string; name: string; email: string; avatar?: string | null } | null
  history?: Array<{
    id: string
    oldStatus: string
    newStatus: string
    justification?: string | null
    changedAt: string
    changer?: { id: string; name: string }
  }>
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl h-28 border border-white/[0.06] animate-pulse"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))',
      }}
    />
  )
}

function TaskDetailDrawer({
  task,
  onClose,
}: {
  task: ArchivedTask
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-white/[0.06] animate-[auth-fade-in_0.25s_ease-out]"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.92) 0%, rgba(8, 12, 10, 0.96) 100%)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3
            className="text-base font-semibold text-[var(--text)] truncate pr-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {task.title}
          </h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[var(--text-muted)]">
              {statusLabels[task.status]}
            </span>
            {task.team && (
              <span className="text-xs px-2 py-0.5 rounded bg-teal-400/10 text-teal-400">
                {task.team.name}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Descrição</p>
              <p className="text-sm text-[var(--text)]">{task.description}</p>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Atribuído a</p>
              <div className="flex items-center gap-2">
                <UserAvatar name={task.assignee.name} avatar={task.assignee.avatar} size="xs" userId={task.assignee.id} />
                <span className="text-sm text-[var(--text)]">{task.assignee.name}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            {task.archivedAt && (
              <span>Arquivada em {new Date(task.archivedAt).toLocaleDateString('pt-BR')}</span>
            )}
            {task.deletedAt && (
              <span>Excluída em {new Date(task.deletedAt).toLocaleDateString('pt-BR')}</span>
            )}
          </div>

          {/* History */}
          {task.history && task.history.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Histórico</p>
              <div className="space-y-2">
                {task.history.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-lg px-3 py-2 border border-white/[0.04] bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text)]">
                        {statusLabels[h.oldStatus as TaskStatus] ?? h.oldStatus} → {statusLabels[h.newStatus as TaskStatus] ?? h.newStatus}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {new Date(h.changedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {h.changer && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">por {h.changer.name}</p>
                    )}
                    {h.justification && (
                      <p className="text-xs text-[var(--text-muted)] italic mt-1">{h.justification}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ArchivedTasks() {
  const [tab, setTab] = useState<TabFilter>('archived')
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined)
  const [selectedTask, setSelectedTask] = useState<ArchivedTask | null>(null)

  const { archivedTasks, isLoading: isLoadingArchived, unarchive, isUnarchiving } = useArchivedTasks(selectedTeamId)
  const { deletedTasks, isLoading: isLoadingDeleted } = useDeletedTasks(selectedTeamId)
  const { data: overview, isLoading: isLoadingOverview } = useAdminOverview()

  const teams: Array<{ id: string; name: string }> = overview?.teams ?? []

  const isLoading = tab === 'archived' ? isLoadingArchived : isLoadingDeleted
  const tasks = tab === 'archived' ? archivedTasks : deletedTasks

  function handleUnarchive(taskId: string) {
    unarchive(taskId, {
      onSuccess: () => toast.success('Tarefa desarquivada com sucesso'),
      onError: () => toast.error('Erro ao desarquivar tarefa'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{
            fontFamily: 'Syne, sans-serif',
            textShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
          }}
        >
          {tab === 'archived' ? 'Tasks Arquivadas' : 'Tasks Excluídas'}
        </h1>

        <select
          value={selectedTeamId ?? ''}
          onChange={(e) => setSelectedTeamId(e.target.value || undefined)}
          disabled={isLoadingOverview}
          className="px-4 py-2 rounded-xl text-sm text-[var(--text)] outline-none border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 cursor-pointer"
        >
          <option value="">Todos os times</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        <button
          onClick={() => setTab('archived')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            tab === 'archived'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent'
          }`}
        >
          Arquivadas
        </button>
        <button
          onClick={() => setTab('deleted')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            tab === 'deleted'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent'
          }`}
        >
          Excluídas
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (tasks as ArchivedTask[]).length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--text-muted)]">
            {tab === 'archived' ? 'Nenhuma task arquivada' : 'Nenhuma task excluída'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(tasks as ArchivedTask[]).map((task) => (
            <div
              key={task.id}
              className="rounded-xl p-4 border border-white/[0.06] flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:border-white/[0.12] transition-all"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
                backdropFilter: 'blur(20px)',
              }}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {task.team && (
                    <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[var(--text-muted)]">
                      {task.team.name}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[var(--text-muted)]">
                    {statusLabels[task.status]}
                  </span>
                  {tab === 'archived' && task.archivedAt && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(task.archivedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {tab === 'deleted' && task.deletedAt && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(task.deletedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              {tab === 'archived' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnarchive(task.id)
                  }}
                  disabled={isUnarchiving}
                  className="flex-shrink-0 text-xs px-4 py-2 rounded-lg border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer disabled:opacity-40"
                >
                  Desarquivar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  )
}
