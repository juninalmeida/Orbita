import { useState } from 'react'
import { X, Trash2, Archive, Check, XCircle, UserPlus } from 'lucide-react'
import { useTaskDetail } from '@/hooks/use-task-detail'
import { useAdminTeamTasks, useAdminUsers } from '@/hooks/use-admin'
import { HistoryTimeline } from './history-timeline'
import { JustificationModal } from './justification-modal'
import { RequestHelpModal } from './request-help-modal'
import { useRemoveHelper } from '@/hooks/use-assignments'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/ui/user-avatar'
import type { TaskStatus } from '@/types/task'

interface TaskDetailModalProps {
  taskId: string | null
  onClose: () => void
  isAdmin?: boolean
  teamId?: string
  onDeleted?: () => void
  onArchived?: () => void
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

export function TaskDetailModal({
  taskId,
  onClose,
  isAdmin = false,
  teamId,
  onDeleted,
  onArchived,
}: TaskDetailModalProps) {
  const { task, history, isLoadingTask, changeStatus } = useTaskDetail(taskId)
  const adminHook = useAdminTeamTasks(teamId ?? '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const { remove: removeHelper } = useRemoveHelper()
  const { user } = useAuth()
  const adminUsers = useAdminUsers(isAdmin)

  const canChangeStatus = isAdmin || (task?.assignments?.some(a => a.user.id === user?.id && a.status === 'assigned') ?? false)

  if (!taskId) return null

  function handleDelete() {
    if (!taskId) return
    adminHook.removeTask(taskId, {
      onSuccess: () => {
        toast.success('Tarefa excluida com sucesso')
        onDeleted?.()
      },
      onError: () => {
        toast.error('Erro ao excluir tarefa')
      },
    })
  }

  function handleArchive() {
    if (!taskId) return
    adminHook.toggleArchive(
      { taskId, archived: true },
      {
        onSuccess: () => {
          toast.success('Tarefa arquivada com sucesso')
          onArchived?.()
        },
        onError: () => {
          toast.error('Erro ao arquivar tarefa')
        },
      },
    )
  }

  function handleSaveTitle() {
    if (!taskId || !editTitle.trim()) return
    adminHook.editTask(
      { taskId, body: { title: editTitle.trim() } },
      {
        onSuccess: () => {
          toast.success('Título atualizado')
          setIsEditingTitle(false)
        },
        onError: () => {
          toast.error('Erro ao atualizar título')
        },
      },
    )
  }

  function handleSaveDesc() {
    if (!taskId) return
    adminHook.editTask(
      { taskId, body: { description: editDesc.trim() || null } },
      {
        onSuccess: () => {
          toast.success('Descrição atualizada')
          setIsEditingDesc(false)
        },
        onError: () => {
          toast.error('Erro ao atualizar descrição')
        },
      },
    )
  }

  function handleResolveRequest(requestId: string, status: 'approved' | 'rejected') {
    // This would need to use resolveRequest from use-admin, but it's not
    // directly available here. We import and call the API directly.
    import('@/api/admin').then(({ resolveRequest }) => {
      resolveRequest(requestId, status)
        .then(() => {
          toast.success(status === 'approved' ? 'Solicitação aprovada' : 'Solicitação rejeitada')
        })
        .catch(() => {
          toast.error('Erro ao processar solicitação')
        })
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-white/[0.06] animate-[auth-fade-in_0.25s_ease-out]"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.88) 0%, rgba(8, 12, 10, 0.94) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.04), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
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
          <div className="flex-1 flex items-center justify-center py-12">
            <span className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Title */}
            <div>
              {isAdmin && isEditingTitle ? (
                <div className="flex gap-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-base font-semibold text-[var(--text)] outline-none focus:border-emerald-500/40"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <h2
                  className={`text-base font-semibold text-[var(--text)] mb-1 ${isAdmin ? 'cursor-pointer hover:text-emerald-400 transition-colors' : ''}`}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                  onClick={() => {
                    if (isAdmin) {
                      setEditTitle(task.title)
                      setIsEditingTitle(true)
                    }
                  }}
                >
                  {task.title}
                </h2>
              )}

              {/* Description */}
              {isAdmin && isEditingDesc ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] outline-none focus:border-emerald-500/40 resize-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsEditingDesc(false)
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveDesc}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : task.description ? (
                <p
                  className={`text-sm text-[var(--text-muted)] ${isAdmin ? 'cursor-pointer hover:text-[var(--text)] transition-colors' : ''}`}
                  onClick={() => {
                    if (isAdmin) {
                      setEditDesc(task.description ?? '')
                      setIsEditingDesc(true)
                    }
                  }}
                >
                  {task.description}
                </p>
              ) : isAdmin ? (
                <p
                  className="text-sm text-[var(--text-muted)]/50 cursor-pointer hover:text-[var(--text-muted)] transition-colors italic"
                  onClick={() => {
                    setEditDesc('')
                    setIsEditingDesc(true)
                  }}
                >
                  Adicionar descrição...
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
              {task.assignments?.filter(a => a.status === 'assigned').map((a) => (
                <div key={a.user.id} className="flex items-center gap-1.5">
                  <UserAvatar name={a.user.name} avatar={a.user.avatar} size="xs" userId={a.user.id} />
                  <span className="text-xs text-[var(--text-muted)]">{a.user.name}</span>
                </div>
              ))}
            </div>

            {/* Assignments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Atribuídos
                </p>
                {(isAdmin || task.assignments?.some(a => a.user.id === user?.id && a.role === 'owner')) && (
                  <button
                    onClick={() => setShowHelpModal(true)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <UserPlus size={12} />
                    Pedir ajuda
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {task.assignments?.filter(a => a.status === 'assigned').map((a) => (
                  <div key={a.user.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={a.user.name} avatar={a.user.avatar} size="xs" userId={a.user.id} />
                      <span className="text-xs text-[var(--text)]">{a.user.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.role === 'owner' ? 'text-emerald-400 bg-emerald-400/10' : 'text-[var(--text-muted)] bg-white/5'}`}>
                        {a.role === 'owner' ? 'Dono' : 'Ajudante'}
                      </span>
                    </div>
                    {a.role === 'helper' && (isAdmin || task.assignments?.some(x => x.user.id === user?.id && x.role === 'owner')) && (
                      <button
                        onClick={() => removeHelper({ taskId: task.id, userId: a.user.id })}
                        className="text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin: Direct assign */}
            {isAdmin && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Atribuir diretamente
                </p>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      adminUsers.assignToTask(
                        { taskId: task.id, userId: e.target.value },
                        {
                          onSuccess: () => toast.success('Membro atribuído com sucesso'),
                          onError: () => toast.error('Erro ao atribuir membro'),
                        },
                      )
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] outline-none border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 cursor-pointer"
                >
                  <option value="">Selecionar usuario...</option>
                  {adminUsers.users
                    ?.filter((u: { id: string }) => !task.assignments?.some(a => a.user.id === u.id))
                    .map((u: { id: string; name: string }) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                Status
              </p>
              {canChangeStatus ? (
                <div className="flex flex-wrap gap-2">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        if (s === task.status) return
                        if (isAdmin) {
                          changeStatus({ status: s })
                        } else {
                          setPendingStatus(s)
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer
                        ${
                          task.status === s
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
                  {statusLabels[task.status]}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                Histórico
              </p>
              <HistoryTimeline history={history} />
            </div>

            {/* Admin: Pending requests section */}
            {isAdmin && 'requests' in task && Array.isArray((task as Record<string, unknown>).requests) && (() => {
                type TaskRequestItem = {
                  id: string
                  status: string
                  type: string
                  message?: string | null
                  user?: { name: string; email: string }
                }
                const requests = ((task as Record<string, unknown>).requests as TaskRequestItem[]).filter((r) => r.status === 'pending')
                if (requests.length === 0) return null
                return (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                      Solicitações pendentes
                    </p>
                    <div className="flex flex-col gap-2">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-lg p-3 border border-white/[0.06]"
                          style={{
                            background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {req.user && (
                                <span className="text-xs text-[var(--text)]">{req.user.name}</span>
                              )}
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  req.type === 'view'
                                    ? 'text-teal-400 bg-teal-400/10'
                                    : 'text-emerald-400 bg-emerald-400/10'
                                }`}
                              >
                                {req.type === 'view' ? 'Visualizar' : 'Participar'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleResolveRequest(req.id, 'approved')}
                                className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleResolveRequest(req.id, 'rejected')}
                                className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              >
                                Rejeitar
                              </button>
                            </div>
                          </div>
                          {req.message && (
                            <p className="text-xs text-[var(--text-muted)] italic mt-1">
                              {req.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

            {/* Admin action buttons */}
            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleArchive}
                  disabled={adminHook.isArchiving}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:border-white/[0.12] hover:text-[var(--text)] transition-all cursor-pointer disabled:opacity-40"
                >
                  <Archive size={13} />
                  Arquivar
                </button>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-[var(--text-muted)]">Confirmar?</span>
                    <button
                      onClick={handleDelete}
                      disabled={adminHook.isRemoving}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Check size={13} />
                      Sim
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                    >
                      <XCircle size={13} />
                      Nao
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer ml-auto"
                  >
                    <Trash2 size={13} />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {task && (
        <RequestHelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          taskId={task.id}
          currentAssignments={task.assignments ?? []}
        />
      )}

      <JustificationModal
        isOpen={pendingStatus !== null}
        newStatus={pendingStatus ?? ''}
        onConfirm={(justification) => {
          if (pendingStatus) {
            changeStatus({ status: pendingStatus, justification })
          }
          setPendingStatus(null)
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  )
}
