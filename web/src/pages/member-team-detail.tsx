import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useTeamCompleted } from '@/hooks/use-task-requests'

const priorityStyles: Record<string, string> = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

interface CompletedTask {
  id: string
  title: string
  priority: string
  updatedAt: string
  assignee?: { id: string; name: string } | null
}

export function MemberTeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { team, isLoading } = useTeamCompleted(id ?? '')

  if (!id) return null

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/teams')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        {isLoading ? (
          <div className="h-6 w-36 rounded bg-[var(--card)] animate-pulse" />
        ) : team ? (
          <h1
            className="text-lg font-bold text-[var(--text)]"
            style={{
              fontFamily: 'Syne, sans-serif',
              textShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            {team.name}
          </h1>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-24 rounded-xl bg-[var(--card)] animate-pulse" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-[var(--card)] animate-pulse" />
            ))}
          </div>
        </div>
      ) : team ? (
        <div className="space-y-6">
          {/* Members section */}
          <div
            className="rounded-xl p-5 border border-white/[0.06]"
            style={{
              background:
                'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
            }}
          >
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
              Membros ({team.members?.length ?? 0})
            </p>
            <div className="flex flex-wrap gap-3">
              {(team.members ?? []).map((m: { id: string; name: string; email: string }) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/60 flex items-center justify-center text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text)]">{m.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed tasks */}
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
              Tasks concluídas ({team.completedTasks?.length ?? 0})
            </p>

            {(team.completedTasks ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 size={28} className="text-[var(--text-muted)] mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">
                  Nenhuma task concluída nesta equipe
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(team.completedTasks as CompletedTask[]).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl px-4 py-3 border border-white/[0.06] flex items-center justify-between gap-3"
                    style={{
                      background:
                        'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
                    }}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm text-[var(--text)] truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        {task.assignee && <span>{task.assignee.name}</span>}
                        <span>
                          {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          priorityStyles[task.priority] ?? 'text-[var(--text-muted)] bg-white/5'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
