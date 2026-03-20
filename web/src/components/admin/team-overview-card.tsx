import { useNavigate } from 'react-router-dom'

interface TeamOverviewMember {
  id: string
  name: string
}

interface TaskCounts {
  pending: number
  in_progress: number
  completed: number
}

interface PriorityCounts {
  low: number
  medium: number
  high: number
}

interface TeamOverview {
  id: string
  name: string
  members: TeamOverviewMember[]
  taskCounts: TaskCounts
  priorityCounts: PriorityCounts
}

interface TeamOverviewCardProps {
  team: TeamOverview
  onDelete?: () => void
  onArchive?: () => void
}

export function TeamOverviewCard({ team, onDelete, onArchive }: TeamOverviewCardProps) {
  const navigate = useNavigate()

  const totalTasks = team.taskCounts.pending + team.taskCounts.in_progress + team.taskCounts.completed
  const maxAvatars = 4
  const visibleMembers = team.members.slice(0, maxAvatars)
  const overflow = team.members.length - maxAvatars

  const pendingPct = totalTasks > 0 ? (team.taskCounts.pending / totalTasks) * 100 : 0
  const inProgressPct = totalTasks > 0 ? (team.taskCounts.in_progress / totalTasks) * 100 : 0
  const completedPct = totalTasks > 0 ? (team.taskCounts.completed / totalTasks) * 100 : 0

  return (
    <div
      className="rounded-xl p-5 border border-white/[0.06] hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Team name */}
      <h3
        className="text-sm font-bold text-[var(--text)] mb-3 truncate"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {team.name}
      </h3>

      {/* Stacked member avatars */}
      <div className="flex items-center mb-4">
        <div className="flex -space-x-2">
          {visibleMembers.map((member) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-emerald-600/60 flex items-center justify-center text-[10px] font-semibold text-emerald-100 ring-2 ring-[rgba(8,12,10,0.88)]"
              title={member.name}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)] ring-2 ring-[rgba(8,12,10,0.88)]">
              +{overflow}
            </div>
          )}
        </div>
        <span className="ml-3 text-xs text-[var(--text-muted)]">
          {team.members.length} membro{team.members.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Mini progress bar */}
      {totalTasks > 0 && (
        <div className="mb-4">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
            {completedPct > 0 && (
              <div
                className="bg-emerald-500"
                style={{ width: `${completedPct}%` }}
              />
            )}
            {inProgressPct > 0 && (
              <div
                className="bg-amber-500"
                style={{ width: `${inProgressPct}%` }}
              />
            )}
            {pendingPct > 0 && (
              <div
                className="bg-slate-500"
                style={{ width: `${pendingPct}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {team.taskCounts.completed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              {team.taskCounts.in_progress}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
              {team.taskCounts.pending}
            </span>
          </div>
        </div>
      )}

      {/* Priority count badges */}
      <div className="flex items-center gap-2 mb-4">
        {team.priorityCounts.low > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/20 text-slate-400">
            {team.priorityCounts.low} low
          </span>
        )}
        {team.priorityCounts.medium > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400">
            {team.priorityCounts.medium} medium
          </span>
        )}
        {team.priorityCounts.high > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-400">
            {team.priorityCounts.high} high
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/admin/teams/${team.id}`)}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-600/10 border border-emerald-500/15 hover:bg-emerald-600/20 transition-colors duration-200 cursor-pointer"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Detalhes
        </button>
        {onArchive && totalTasks > 0 && (
          <button
            onClick={onArchive}
            className="py-2 px-3 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/20 transition-colors duration-200 cursor-pointer"
            title="Arquivar todas as tasks"
          >
            Arquivar
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="py-2 px-3 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/20 transition-colors duration-200 cursor-pointer"
            title="Excluir equipe"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}
