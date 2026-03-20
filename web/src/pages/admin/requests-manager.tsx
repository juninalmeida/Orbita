import { usePendingRequests } from '@/hooks/use-admin'
import { toast } from 'sonner'
import type { TaskRequest } from '@/types/task-request'

function SkeletonCard() {
  return (
    <div
      className="rounded-xl h-32 border border-white/[0.06] animate-pulse"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))',
      }}
    />
  )
}

export function RequestsManager() {
  const { requests, isLoading, resolve, isResolving } = usePendingRequests()

  function handleResolve(requestId: string, status: 'approved' | 'rejected') {
    resolve(
      { requestId, status },
      {
        onSuccess: () => {
          toast.success(
            status === 'approved'
              ? 'Solicitação aprovada com sucesso'
              : 'Solicitação rejeitada',
          )
        },
        onError: () => {
          toast.error('Erro ao processar solicitação')
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{
            fontFamily: 'Syne, sans-serif',
            textShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
          }}
        >
          Solicitações
        </h1>
        {!isLoading && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
            {(requests as TaskRequest[]).length}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (requests as TaskRequest[]).length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--text-muted)]">
            Nenhuma solicitação pendente
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(requests as TaskRequest[]).map((req) => (
            <div
              key={req.id}
              className="rounded-xl p-4 border border-white/[0.06]"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left section */}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  {/* Member info */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600/50 flex items-center justify-center text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20 flex-shrink-0">
                      {req.user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">
                        {req.user?.name ?? 'Usuário'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {req.user?.email ?? ''}
                      </p>
                    </div>
                  </div>

                  {/* Task + team info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[var(--text)]">
                      {req.task?.title ?? 'Tarefa'}
                    </span>
                    {req.task?.team && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/[0.05] text-[var(--text-muted)]">
                        {req.task.team.name}
                      </span>
                    )}
                  </div>

                  {/* Type badge + message */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        req.type === 'view'
                          ? 'text-teal-400 bg-teal-400/10'
                          : 'text-emerald-400 bg-emerald-400/10'
                      }`}
                    >
                      {req.type === 'view' ? 'Visualizar' : 'Participar'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-[var(--text-muted)] italic mt-1">
                      {req.message}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-shrink-0 self-center">
                  <button
                    onClick={() => handleResolve(req.id, 'approved')}
                    disabled={isResolving}
                    className="text-xs px-4 py-2 rounded-lg bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-50 font-medium transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleResolve(req.id, 'rejected')}
                    disabled={isResolving}
                    className="text-xs px-4 py-2 rounded-lg border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 font-medium transition-all cursor-pointer disabled:opacity-40"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
