import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAllTeams } from '@/hooks/use-task-requests'

interface TeamItem {
  id: string
  name: string
  members: { id: string; name: string; email: string; avatar?: string | null }[]
  completedTasksCount: number
}

export function TeamsListPage() {
  const { teams, isLoading } = useAllTeams()
  const navigate = useNavigate()

  return (
    <div className="min-w-0">
      <h1
        className="text-xl font-bold text-[var(--text)] mb-6"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        Equipes
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={32} className="text-[var(--text-muted)] mb-3 opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            Nenhuma equipe encontrada
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: TeamItem) => {
            const maxAvatars = 5
            const visible = team.members.slice(0, maxAvatars)
            const overflow = team.members.length - maxAvatars

            return (
              <div
                key={team.id}
                className="rounded-xl p-5 border border-white/[0.06] hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] transition-all duration-200 hover:translate-y-[-2px] flex flex-col"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <h3
                  className="text-sm font-bold text-[var(--text)] mb-3 truncate"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {team.name}
                </h3>

                {/* Members */}
                <div className="flex items-center mb-4">
                  <div className="flex -space-x-2">
                    {visible.map((m) => (
                      <UserAvatar key={m.id} name={m.name} avatar={m.avatar} size="sm" className="ring-2 ring-[rgba(8,12,10,0.88)]" />
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

                {/* Completed count */}
                <div className="flex items-center gap-2 mb-4 text-xs text-[var(--text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {team.completedTasksCount} task{team.completedTasksCount !== 1 ? 's' : ''} concluída{team.completedTasksCount !== 1 ? 's' : ''}
                </div>

                <button
                  onClick={() => navigate(`/dashboard/teams/${team.id}`)}
                  className="mt-auto w-full py-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-600/10 border border-emerald-500/15 hover:bg-emerald-600/20 transition-colors duration-200 cursor-pointer"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Ver detalhes
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
