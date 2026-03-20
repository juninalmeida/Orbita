import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAdminTeamTasks, useAdminTeams } from '@/hooks/use-admin'
import { getAdminTeam } from '@/api/admin'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { toast } from 'sonner'

export function AdminTeamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addMember, isAddingMember, removeMember, isRemovingMember } = useAdminTeams()

  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')

  const { data: team, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['admin-team', id],
    queryFn: () => getAdminTeam(id!),
    enabled: !!id,
  })

  const {
    tasks,
    isLoading: isLoadingTasks,
    editTask,
  } = useAdminTeamTasks(id ?? '')

  function handleAddMember() {
    if (!memberEmail.trim() || !id) return
    addMember(
      { teamId: id, email: memberEmail.trim() },
      {
        onSuccess: () => {
          toast.success('Membro adicionado com sucesso')
          setMemberEmail('')
          setShowAddMember(false)
          queryClient.invalidateQueries({ queryKey: ['admin-team', id] })
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Erro ao adicionar membro')
        },
      },
    )
  }

  function handleRemoveMember(userId: string, name: string) {
    if (!id) return
    removeMember(
      { teamId: id, userId },
      {
        onSuccess: () => {
          toast.success(`${name} removido da equipe`)
          queryClient.invalidateQueries({ queryKey: ['admin-team', id] })
        },
        onError: () => toast.error('Erro ao remover membro'),
      },
    )
  }

  if (!id) return null

  const members = team?.members?.map((m: { user?: { id: string; name: string; email: string }; id?: string; name?: string; email?: string }) =>
    m.user ? m.user : m,
  ) ?? []

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        {isLoadingTeam ? (
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

      {/* Members section */}
      {team && (
        <div
          className="rounded-xl p-5 border border-white/[0.06] mb-6"
          style={{
            background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Membros ({members.length})
            </p>
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Adicionar
            </button>
          </div>

          {showAddMember && (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="E-mail do membro"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-[var(--text)] outline-none border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 placeholder:text-[var(--text-muted)]/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                autoFocus
              />
              <button
                onClick={handleAddMember}
                disabled={isAddingMember || !memberEmail.trim()}
                className="px-3 py-2 rounded-lg text-xs font-medium text-emerald-50 bg-emerald-700/80 hover:bg-emerald-600/90 transition-all cursor-pointer disabled:opacity-40"
              >
                {isAddingMember ? '...' : 'Adicionar'}
              </button>
              <button
                onClick={() => { setShowAddMember(false); setMemberEmail('') }}
                className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {members.map((m: { id: string; name: string; email: string; avatar?: string | null }) => (
              <div key={m.id} className="flex items-center gap-2 group">
                <UserAvatar name={m.name} avatar={m.avatar} size="md" userId={m.id} />
                <div>
                  <p className="text-xs text-[var(--text)]">{m.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{m.email}</p>
                </div>
                <button
                  onClick={() => handleRemoveMember(m.id, m.name)}
                  disabled={isRemovingMember}
                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all cursor-pointer disabled:opacity-40 ml-1"
                  title="Remover membro"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <KanbanBoard
        teamId={id}
        isAdmin
        adminTasks={tasks}
        adminIsLoading={isLoadingTasks}
        adminChangeStatus={({ taskId, status }) =>
          editTask({ taskId, body: { status } })
        }
      />
    </div>
  )
}
