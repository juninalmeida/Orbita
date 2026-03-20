import { useState } from 'react'
import { ChevronDown, Inbox, Clock } from 'lucide-react'
import { useTeams } from '@/hooks/use-teams'
import { useAvailableTasks, useMyRequests } from '@/hooks/use-task-requests'
import { RequestAccessModal } from '@/components/task/request-access-modal'
import { toast } from 'sonner'
import type { TaskRequest } from '@/types/task-request'

const statusBadge: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pendente',
    className: 'text-amber-400 bg-amber-400/10',
  },
  approved: {
    label: 'Aprovado',
    className: 'text-emerald-400 bg-emerald-400/10',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'text-rose-400 bg-rose-400/10',
  },
}

const taskStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

const taskStatusStyles: Record<string, string> = {
  pending: 'text-[var(--text-muted)] bg-white/5',
  in_progress: 'text-[var(--warning)] bg-[var(--warning)]/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
}

const priorityStyles: Record<string, string> = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

interface AvailableTask {
  id: string
  title: string
  status: string
  priority: string
  team?: { id: string; name: string }
}

export function AvailableTasks() {
  const { teams, isLoading: teamsLoading } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)

  const { availableTasks, isLoading: tasksLoading } = useAvailableTasks(
    selectedTeamId || undefined,
  )
  const { myRequests, isLoading: requestsLoading, requestAccess } = useMyRequests()

  const [requestModal, setRequestModal] = useState<{
    taskId: string
    taskTitle: string
  } | null>(null)

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  // Map of taskId -> request status for quick lookup
  const requestsByTask = new Map<string, string>()
  myRequests.forEach((r: TaskRequest) => {
    if (r.taskId) {
      const existing = requestsByTask.get(r.taskId)
      // Priority: approved > pending > rejected
      if (!existing || r.status === 'approved' || (r.status === 'pending' && existing === 'rejected')) {
        requestsByTask.set(r.taskId, r.status)
      }
    }
  })

  function handleRequestAccess(type: 'view' | 'participate', message?: string) {
    if (!requestModal) return
    requestAccess(
      { taskId: requestModal.taskId, type, message },
      {
        onSuccess: () => {
          toast.success('Solicitação enviada com sucesso')
          setRequestModal(null)
        },
        onError: () => {
          toast.error('Erro ao enviar solicitação')
        },
      },
    )
  }

  return (
    <div className="min-w-0">
      <h1
        className="text-xl font-bold text-[var(--text)] mb-6"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        Tasks Disponíveis
      </h1>

      {/* Team filter */}
      <div className="relative mb-6">
        <button
          onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-[var(--text)] hover:border-white/[0.12] transition-all cursor-pointer"
          style={{
            background:
              'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
          }}
        >
          {teamsLoading ? (
            <span className="text-[var(--text-muted)]">Carregando...</span>
          ) : selectedTeam ? (
            selectedTeam.name
          ) : (
            'Todos os times'
          )}
          <ChevronDown
            size={14}
            className={`text-[var(--text-muted)] transition-transform ${
              teamDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {teamDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-white/[0.06] py-1 z-10"
            style={{
              background:
                'linear-gradient(145deg, rgba(10, 18, 14, 0.95) 0%, rgba(8, 12, 10, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <button
              onClick={() => {
                setSelectedTeamId('')
                setTeamDropdownOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                !selectedTeamId
                  ? 'text-emerald-400 bg-emerald-500/5'
                  : 'text-[var(--text)] hover:bg-white/[0.04]'
              }`}
            >
              Todos os times
            </button>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeamId(team.id)
                  setTeamDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  team.id === selectedTeamId
                    ? 'text-emerald-400 bg-emerald-500/5'
                    : 'text-[var(--text)] hover:bg-white/[0.04]'
                }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available tasks grid */}
      {tasksLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      ) : availableTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={32} className="text-[var(--text-muted)] mb-3 opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            Nenhuma task disponível
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableTasks.map((task: AvailableTask) => {
            const existingRequest = requestsByTask.get(task.id)
            return (
              <div
                key={task.id}
                className="rounded-xl p-4 border border-white/[0.06] flex flex-col gap-3"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
                }}
              >
                <p className="text-sm text-[var(--text)] leading-snug line-clamp-2">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      taskStatusStyles[task.status] ?? 'text-[var(--text-muted)] bg-white/5'
                    }`}
                  >
                    {taskStatusLabels[task.status] ?? task.status}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      priorityStyles[task.priority] ?? 'text-[var(--text-muted)] bg-white/5'
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.team && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium text-teal-400 bg-teal-400/10">
                      {task.team.name}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  {existingRequest === 'pending' ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 inline-block">
                      Pendente
                    </span>
                  ) : existingRequest === 'approved' ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 inline-block">
                      Aprovado
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setRequestModal({
                          taskId: task.id,
                          taskTitle: task.title,
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer border border-emerald-500/20"
                    >
                      Pedir acesso
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/[0.06] my-8" />

      {/* My requests section */}
      <h2
        className="text-base font-semibold text-[var(--text)] mb-4"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        Minhas solicitações
      </h2>

      {requestsLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      ) : myRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock size={28} className="text-[var(--text-muted)] mb-3 opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            Você ainda não fez nenhuma solicitação
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {myRequests.map((req: TaskRequest) => {
            const badge = statusBadge[req.status] ?? statusBadge.pending
            return (
              <div
                key={req.id}
                className="rounded-xl px-4 py-3 border border-white/[0.06] flex items-center justify-between gap-3"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
                }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm text-[var(--text)] truncate">
                    {req.task?.title ?? 'Task'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>
                      {req.type === 'view' ? 'Visualizar' : 'Participar'}
                    </span>
                    <span>
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <RequestAccessModal
        isOpen={requestModal !== null}
        taskTitle={requestModal?.taskTitle ?? ''}
        onSubmit={handleRequestAccess}
        onCancel={() => setRequestModal(null)}
      />
    </div>
  )
}
