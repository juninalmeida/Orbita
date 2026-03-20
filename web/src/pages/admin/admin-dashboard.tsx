import { useState } from 'react'
import { Users, UserCheck, ClipboardList, TrendingUp, Plus, X } from 'lucide-react'
import { useAdminOverview, useAdminTeams, useArchiveTeamTasks } from '@/hooks/use-admin'
import { MetricCard } from '@/components/admin/metric-card'
import { TeamOverviewCard } from '@/components/admin/team-overview-card'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { toast } from 'sonner'

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

function SkeletonTeamCard() {
  return (
    <div
      className="rounded-xl h-56 border border-white/[0.06] animate-pulse"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))',
      }}
    />
  )
}

export function AdminDashboard() {
  const { data, isLoading } = useAdminOverview()
  const { createTeam, isCreating, deleteTeam, isDeleting } = useAdminTeams()
  const { archiveAll, isArchiving } = useArchiveTeamTasks()
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null)
  const [teamToArchive, setTeamToArchive] = useState<{ id: string; name: string } | null>(null)

  function handleCreateTeam() {
    if (!newTeamName.trim()) return
    createTeam(
      { name: newTeamName.trim() },
      {
        onSuccess: () => {
          toast.success('Equipe criada com sucesso')
          setNewTeamName('')
          setShowCreateTeam(false)
        },
        onError: () => toast.error('Erro ao criar equipe'),
      },
    )
  }

  function handleArchiveTeam() {
    if (!teamToArchive) return
    archiveAll(teamToArchive.id, {
      onSuccess: () => {
        toast.success('Tasks da equipe arquivadas com sucesso')
        setTeamToArchive(null)
      },
      onError: () => toast.error('Erro ao arquivar tasks'),
    })
  }

  function handleDeleteTeam() {
    if (!teamToDelete) return
    deleteTeam(teamToDelete.id, {
      onSuccess: () => {
        toast.success('Equipe excluída com sucesso')
        setTeamToDelete(null)
      },
      onError: () => toast.error('Erro ao excluir equipe'),
    })
  }

  return (
    <div className="space-y-8">
      {/* Page title */}
      <h1
        className="text-2xl font-bold text-[var(--text)]"
        style={{
          fontFamily: 'Syne, sans-serif',
          textShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
        }}
      >
        Painel Administrativo
      </h1>

      {/* Metric cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label="Total de Equipes"
            value={data?.metrics?.totalTeams ?? 0}
          />
          <MetricCard
            icon={UserCheck}
            label="Total de Membros"
            value={data?.metrics?.totalMembers ?? 0}
          />
          <MetricCard
            icon={ClipboardList}
            label="Tasks Ativas"
            value={data?.metrics?.activeTasks ?? 0}
          />
          <MetricCard
            icon={TrendingUp}
            label="Conclusão"
            value={data?.metrics?.completionRate ?? 0}
            suffix="%"
          />
        </div>
      )}

      {/* Teams section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-[var(--text)]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Equipes
          </h2>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-600/10 border border-emerald-500/15 hover:bg-emerald-600/20 transition-colors cursor-pointer"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            <Plus size={14} />
            Nova equipe
          </button>
        </div>

        {/* Create team inline form */}
        {showCreateTeam && (
          <div
            className="rounded-xl p-4 border border-emerald-500/20 mb-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
            }}
          >
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nome da equipe"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[var(--text)] outline-none border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 placeholder:text-[var(--text-muted)]/50"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
              autoFocus
            />
            <button
              onClick={handleCreateTeam}
              disabled={isCreating || !newTeamName.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-emerald-50 bg-emerald-700/80 hover:bg-emerald-600/90 transition-all cursor-pointer disabled:opacity-40"
            >
              {isCreating ? 'Criando...' : 'Criar'}
            </button>
            <button
              onClick={() => { setShowCreateTeam(false); setNewTeamName('') }}
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonTeamCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.teams ?? []).map(
              (team: {
                id: string
                name: string
                members: { id: string; name: string }[]
                tasksByStatus: { pending: number; in_progress: number; completed: number }
                tasksByPriority: { low: number; medium: number; high: number }
              }) => (
                <TeamOverviewCard
                  key={team.id}
                  team={{
                    ...team,
                    taskCounts: team.tasksByStatus,
                    priorityCounts: team.tasksByPriority,
                  }}
                  onDelete={() => setTeamToDelete({ id: team.id, name: team.name })}
                  onArchive={() => setTeamToArchive({ id: team.id, name: team.name })}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Delete team confirmation modal */}
      {teamToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setTeamToDelete(null)}
        >
          <div
            className="rounded-2xl w-full max-w-sm border border-white/[0.06] p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.95), rgba(8, 12, 10, 0.98))',
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-base font-semibold text-[var(--text)] mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Excluir equipe
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              Tem certeza que deseja excluir a equipe <strong className="text-[var(--text)]">{teamToDelete.name}</strong>? Todas as tasks e dados relacionados serão removidos permanentemente.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTeamToDelete(null)}
                className="text-xs px-4 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={isDeleting}
                className="text-xs px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-500/90 text-rose-50 font-medium transition-all cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive team confirmation modal */}
      {teamToArchive && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setTeamToArchive(null)}
        >
          <div
            className="rounded-2xl w-full max-w-sm border border-white/[0.06] p-5"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.95), rgba(8, 12, 10, 0.98))',
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-base font-semibold text-[var(--text)] mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Arquivar tasks da equipe
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              Todas as tasks ativas da equipe <strong className="text-[var(--text)]">{teamToArchive.name}</strong> serão arquivadas. Você pode desarquivá-las depois.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTeamToArchive(null)}
                className="text-xs px-4 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchiveTeam}
                disabled={isArchiving}
                className="text-xs px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-500/90 text-amber-50 font-medium transition-all cursor-pointer disabled:opacity-40"
              >
                {isArchiving ? 'Arquivando...' : 'Arquivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics section */}
      <div id="analytics-section">
        <h2
          className="text-lg font-semibold text-[var(--text)] mb-4"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Analytics
        </h2>
        <AnalyticsCharts />
      </div>
    </div>
  )
}
