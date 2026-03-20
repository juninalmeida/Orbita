import { useState } from 'react'
import { X, Search, UserPlus } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useUsers } from '@/hooks/use-users'
import { useRequestHelp } from '@/hooks/use-assignments'
import { toast } from 'sonner'
import type { TaskAssignment } from '@/types/assignment'

interface RequestHelpModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  currentAssignments: TaskAssignment[]
}

export function RequestHelpModal({ isOpen, onClose, taskId, currentAssignments }: RequestHelpModalProps) {
  const { users, isLoading } = useUsers()
  const { sendRequest, isPending } = useRequestHelp()
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const assignedIds = new Set(currentAssignments.map((a) => a.user.id))

  const filtered = users.filter(
    (u) =>
      !assignedIds.has(u.id) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  )

  function handleRequest(userId: string) {
    sendRequest(
      { taskId, userId },
      {
        onSuccess: () => {
          toast.success('Solicitacao de ajuda enviada!')
          onClose()
        },
        onError: () => {
          toast.error('Erro ao enviar solicitacao')
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div
        className="rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col border border-white/[0.06] animate-[auth-fade-in_0.25s_ease-out]"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.92) 0%, rgba(8, 12, 10, 0.96) 100%)',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.04), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-[var(--text)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Pedir ajuda
          </h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.04]">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-[var(--text-muted)]">Nenhum usuario encontrado</p>
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} avatar={user.avatar} size="sm" userId={user.id} />
                  <div>
                    <p className="text-sm text-[var(--text)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRequest(user.id)}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <UserPlus size={12} />
                  Convidar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
