import { useParams, Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { usePublicProfile } from '@/hooks/use-profile'
import { useAuth } from '@/hooks/use-auth'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { ProfileMetrics } from '@/components/profile/profile-metrics'

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, isLoading } = usePublicProfile(id)
  const { user: currentUser } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--text-muted)]">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <AvatarUpload
          currentAvatar={profile.avatar}
          userName={profile.name}
          readOnly
        />

        <div className="flex flex-col items-center gap-2">
          <h2
            className="text-lg font-semibold text-[var(--text)]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {profile.name}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">{profile.email}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              profile.role === 'admin'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-emerald-400 bg-emerald-400/10'
            }`}
          >
            {profile.role === 'admin' ? 'Admin' : 'Membro'}
          </span>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div
          className="rounded-2xl p-5 border border-white/[0.06]"
          style={{
            background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.6), rgba(8, 12, 10, 0.8))',
          }}
        >
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Bio
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Metrics */}
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Métricas
        </p>
        <ProfileMetrics
          totalAssigned={profile.metrics.totalAssigned}
          totalCompleted={profile.metrics.totalCompleted}
          completionRate={profile.metrics.completionRate}
        />
      </div>

      {/* Teams */}
      {profile.teams.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Times
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.teams.map((team) => (
              <Link
                key={team.id}
                to={currentUser?.role === 'admin' ? `/admin/teams/${team.id}` : `/teams/${team.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text)] bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
              >
                <Users size={12} className="text-emerald-400" />
                {team.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
