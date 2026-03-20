import { useState } from 'react'
import { Shield, ShieldOff, Trash2, Check, XCircle } from 'lucide-react'
import { useAdminUsers } from '@/hooks/use-admin'
import { UserAvatar } from '@/components/ui/user-avatar'
import { toast } from 'sonner'

export function AdminUsers() {
  const { users, isLoading, changeRole, deleteUser } = useAdminUsers()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleChangeRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    changeRole(
      { userId, role: newRole as 'admin' | 'member' },
      {
        onSuccess: () => toast.success(`Role alterado para ${newRole}`),
        onError: (err: Error) => toast.error(err.message || 'Erro ao alterar role'),
      },
    )
  }

  function handleDelete(userId: string) {
    deleteUser(userId, {
      onSuccess: () => {
        toast.success('Usuario removido com sucesso')
        setConfirmDeleteId(null)
      },
      onError: (err: Error) => toast.error(err.message || 'Erro ao remover usuario'),
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-6 w-40 rounded bg-[var(--card)] animate-pulse mb-6" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--card)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-[var(--text)] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
        Usuarios ({users.length})
      </h2>

      <div className="flex flex-col gap-2">
        {users.map((user: {
          id: string; name: string; email: string; role: string; avatar?: string | null;
          teams: Array<{ id: string; name: string }>; assignedTasksCount: number
        }) => (
          <div
            key={user.id}
            className="rounded-xl p-4 border border-white/[0.06] flex items-center gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)' }}
          >
            <UserAvatar name={user.name} avatar={user.avatar} size="lg" userId={user.id} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-[var(--text)] truncate">{user.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  user.role === 'admin' ? 'text-amber-400 bg-amber-400/10' : 'text-[var(--text-muted)] bg-white/5'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-1">
                {user.teams.length > 0 && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {user.teams.length} {user.teams.length === 1 ? 'time' : 'times'}
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                  {user.assignedTasksCount} {user.assignedTasksCount === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleChangeRole(user.id, user.role)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:border-white/[0.12] hover:text-[var(--text)] transition-all cursor-pointer"
                title={user.role === 'admin' ? 'Rebaixar para membro' : 'Promover a admin'}
              >
                {user.role === 'admin' ? <ShieldOff size={13} /> : <Shield size={13} />}
              </button>

              {confirmDeleteId === user.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(user.id)} className="text-xs px-2 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1.5 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
                    <XCircle size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(user.id)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
