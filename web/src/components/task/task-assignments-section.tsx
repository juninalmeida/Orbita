import { X, UserPlus } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

interface Assignment {
  user: { id: string; name: string; email: string; avatar?: string | null }
  role: string
  status: string
}

interface TaskAssignmentsSectionProps {
  assignments: Assignment[]
  isAdmin: boolean
  isOwner: boolean
  onRemoveHelper: (userId: string) => void
  onRequestHelp: () => void
}

export function TaskAssignmentsSection({
  assignments,
  isAdmin,
  isOwner,
  onRemoveHelper,
  onRequestHelp,
}: TaskAssignmentsSectionProps) {
  const assigned = assignments.filter((a) => a.status === 'assigned')
  const canManage = isAdmin || isOwner

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Assigned
        </p>
        {canManage && (
          <button
            onClick={onRequestHelp}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <UserPlus size={12} />
            Request help
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {assigned.map((a) => (
          <div key={a.user.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <UserAvatar name={a.user.name} avatar={a.user.avatar} size="xs" userId={a.user.id} />
              <span className="text-xs text-[var(--text)]">{a.user.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.role === 'owner' ? 'text-emerald-400 bg-emerald-400/10' : 'text-[var(--text-muted)] bg-white/5'}`}>
                {a.role === 'owner' ? 'Owner' : 'Helper'}
              </span>
            </div>
            {a.role === 'helper' && canManage && (
              <button
                onClick={() => onRemoveHelper(a.user.id)}
                className="text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
