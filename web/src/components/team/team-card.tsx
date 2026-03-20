import { useNavigate } from 'react-router-dom'
import { Users, CheckSquare } from 'lucide-react'
import type { Team } from '@/types/team'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/teams/${team.id}`)}
      className='rounded-xl p-5 cursor-pointer transition-all duration-200 hover:translate-y-[-2px] border border-white/[0.06] hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]'
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.5) 0%, rgba(8, 12, 10, 0.65) 100%)',
      }}
    >
      <div className='flex items-start justify-between mb-4'>
        <div
          className='w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400'
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <h3
        className='text-sm font-semibold text-[var(--text)] mb-1 truncate'
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {team.name}
      </h3>

      <div className='flex items-center gap-4 mt-3'>
        <span className='flex items-center gap-1.5 text-xs text-[var(--text-muted)]'>
          <Users size={12} />
          {team._count?.members ?? 0}
        </span>
        <span className='flex items-center gap-1.5 text-xs text-[var(--text-muted)]'>
          <CheckSquare size={12} />
          {team._count?.tasks ?? 0}
        </span>
      </div>
    </div>
  )
}
