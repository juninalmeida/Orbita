import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTeams } from '@/hooks/use-teams'
import { TeamCard } from '@/components/team/team-card'
import { CreateTeamModal } from '@/components/team/create-team-modal'

export function DashboardPage() {
  const { teams, isLoading } = useTeams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <p className='text-sm text-[var(--text-muted)]'>
          {teams.length} {teams.length === 1 ? 'time' : 'times'}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95'
        >
          <Plus size={15} />
          Novo time
        </button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-32 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse'
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 text-center'>
          <p className='text-sm text-[var(--text-muted)]'>
            Nenhum time ainda.
          </p>
          <p className='text-xs text-[var(--text-muted)] mt-1'>
            Crie seu primeiro time para começar.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}