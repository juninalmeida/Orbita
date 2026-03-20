import { useState } from 'react'
import { X } from 'lucide-react'
import { useTaskDetail } from '@/hooks/use-task-detail'
import { useAdminTeamTasks, useAdminUsers } from '@/hooks/use-admin'
import { HistoryTimeline } from './history-timeline'
import { JustificationModal } from './justification-modal'
import { RequestHelpModal } from './request-help-modal'
import { TaskTitleEditor } from './task-title-editor'
import { TaskDescriptionEditor } from './task-description-editor'
import { TaskAssignmentsSection } from './task-assignments-section'
import { TaskStatusSelector } from './task-status-selector'
import { TaskAdminActions } from './task-admin-actions'
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

const priorityStyles = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

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
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const { remove: removeHelper } = useRemoveHelper()
  const { user } = useAuth()
  const adminUsers = useAdminUsers(isAdmin)

  const isOwner = task?.assignments?.some(a => a.user.id === user?.id && a.role === 'owner') ?? false
  const canChangeStatus = isAdmin || (task?.assignments?.some(a => a.user.id === user?.id && a.status === 'assigned') ?? false)

  if (!taskId) return null

  function handleSaveTitle(title: string) {
    if (!taskId) return
    adminHook.editTask(
      { taskId, body: { title } },
      {
        onSuccess: () => toast.success('Title updated'),
        onError: () => toast.error('Failed to update title'),
      },
    )
  }

  function handleSaveDescription(description: string | null) {
    if (!taskId) return
    adminHook.editTask(
      { taskId, body: { description } },
      {
        onSuccess: () => toast.success('Description updated'),
        onError: () => toast.error('Failed to update description'),
      },
    )
  }

  function handleDelete() {
    if (!taskId) return
    adminHook.removeTask(taskId, {
      onSuccess: () => {
        toast.success('Task deleted successfully')
        onDeleted?.()
      },
      onError: () => toast.error('Failed to delete task'),
    })
  }

  function handleArchive() {
    if (!taskId) return
    adminHook.toggleArchive(
      { taskId, archived: true },
      {
        onSuccess: () => {
          toast.success('Task archived successfully')
          onArchived?.()
        },
        onError: () => toast.error('Failed to archive task'),
      },
    )
  }

  function handleResolveRequest(requestId: string, status: 'approved' | 'rejected') {
    import('@/api/admin').then(({ resolveRequest }) => {
      resolveRequest(requestId, status)
        .then(() => toast.success(status === 'approved' ? 'Request approved' : 'Request rejected'))
        .catch(() => toast.error('Failed to process request'))
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="text-xs font-mono text-[var(--text-muted)]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ORB-{taskId.slice(0, 4).toUpperCase()}
          </span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {isLoadingTask ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <span className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Title & Description */}
            <div>
              <TaskTitleEditor title={task.title} isAdmin={isAdmin} onSave={handleSaveTitle} />
              <TaskDescriptionEditor description={task.description} isAdmin={isAdmin} onSave={handleSaveDescription} />
            </div>

            {/* Priority & quick avatar preview */}
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
            <TaskAssignmentsSection
              assignments={task.assignments ?? []}
              isAdmin={isAdmin}
              isOwner={isOwner}
              onRemoveHelper={(userId) => removeHelper({ taskId: task.id, userId })}
              onRequestHelp={() => setShowHelpModal(true)}
            />

            {/* Admin: Direct assign */}
            {isAdmin && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                  Direct assign
                </p>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      adminUsers.assignToTask(
                        { taskId: task.id, userId: e.target.value },
                        {
                          onSuccess: () => toast.success('Member assigned successfully'),
                          onError: () => toast.error('Failed to assign member'),
                        },
                      )
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] outline-none border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 cursor-pointer"
                >
                  <option value="">Select user...</option>
                  {adminUsers.users
                    ?.filter((u: { id: string }) => !task.assignments?.some(a => a.user.id === u.id))
                    .map((u: { id: string; name: string }) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>
            )}

            {/* Status */}
            <TaskStatusSelector
              currentStatus={task.status}
              canChange={canChangeStatus}
              isAdmin={isAdmin}
              onStatusChange={(status) => changeStatus({ status })}
              onStatusChangeWithJustification={(status) => setPendingStatus(status)}
            />

            {/* History */}
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                History
              </p>
              <HistoryTimeline history={history} />
            </div>

            {/* Admin: Pending requests */}
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
                      Pending requests
                    </p>
                    <div className="flex flex-col gap-2">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-lg p-3 border border-white/[0.06]"
                          style={{ background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))' }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {req.user && <span className="text-xs text-[var(--text)]">{req.user.name}</span>}
                              <span className={`text-xs px-1.5 py-0.5 rounded ${req.type === 'view' ? 'text-teal-400 bg-teal-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                                {req.type === 'view' ? 'View' : 'Participate'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleResolveRequest(req.id, 'approved')}
                                className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleResolveRequest(req.id, 'rejected')}
                                className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                          {req.message && <p className="text-xs text-[var(--text-muted)] italic mt-1">{req.message}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

            {/* Admin actions */}
            {isAdmin && (
              <TaskAdminActions
                onArchive={handleArchive}
                onDelete={handleDelete}
                isArchiving={adminHook.isArchiving}
                isDeleting={adminHook.isRemoving}
              />
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
          if (pendingStatus) changeStatus({ status: pendingStatus, justification })
          setPendingStatus(null)
        }}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  )
}
