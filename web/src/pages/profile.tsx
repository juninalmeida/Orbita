import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Save, Loader2, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePublicProfile, useUpdateProfile } from '@/hooks/use-profile'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { ProfileMetrics } from '@/components/profile/profile-metrics'
import { toast } from 'sonner'

export function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading: isLoadingProfile } = usePublicProfile(user?.id)
  const { mutate: saveProfile, isPending: isSaving } = useUpdateProfile()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio ?? '')
    }
  }, [user])

  function handleSave() {
    if (name.trim().length < 2) {
      toast.error('Nome deve ter pelo menos 2 caracteres')
      return
    }

    saveProfile(
      { name: name.trim(), bio: bio.trim() || null },
      {
        onSuccess: () => toast.success('Perfil atualizado'),
        onError: () => toast.error('Erro ao atualizar perfil'),
      },
    )
  }

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <AvatarUpload currentAvatar={user.avatar} userName={user.name} />

        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              user.role === 'admin'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-emerald-400 bg-emerald-400/10'
            }`}
          >
            {user.role === 'admin' ? 'Admin' : 'Membro'}
          </span>
        </div>
      </div>

      {/* Form */}
      <div
        className="rounded-2xl p-6 border border-white/[0.06] flex flex-col gap-5"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.6), rgba(8, 12, 10, 0.8))',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] bg-white/[0.04] border border-white/[0.06] outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            E-mail
          </label>
          <input
            value={user.email}
            disabled
            className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] bg-white/[0.02] border border-white/[0.04] cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Bio
            </label>
            <span className="text-xs text-[var(--text-muted)]">{bio.length}/300</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Conte um pouco sobre você..."
            className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text)] bg-white/[0.04] border border-white/[0.06] outline-none focus:border-emerald-500/40 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Salvar alterações
        </button>
      </div>

      {/* Metrics */}
      {isLoadingProfile ? (
        <div className="flex justify-center py-6">
          <span className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : profile ? (
        <>
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

          {profile.teams.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Times
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.teams.map((team) => (
                  <Link
                    key={team.id}
                    to={user.role === 'admin' ? `/admin/teams/${team.id}` : `/teams/${team.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text)] bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
                  >
                    <Users size={12} className="text-emerald-400" />
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
