import { useState } from 'react'
import { Eye, UserPlus } from 'lucide-react'

interface RequestAccessModalProps {
  isOpen: boolean
  taskTitle: string
  onSubmit: (type: 'view' | 'participate', message?: string) => void
  onCancel: () => void
}

export function RequestAccessModal({
  isOpen,
  taskTitle,
  onSubmit,
  onCancel,
}: RequestAccessModalProps) {
  const [type, setType] = useState<'view' | 'participate'>('view')
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  function handleSubmit() {
    onSubmit(type, message.trim() || undefined)
    setType('view')
    setMessage('')
  }

  function handleCancel() {
    setType('view')
    setMessage('')
    onCancel()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
    >
      <div
        className="rounded-2xl w-full max-w-md border border-white/[0.06] animate-[auth-fade-in_0.25s_ease-out]"
        style={{
          background:
            'linear-gradient(145deg, rgba(10, 18, 14, 0.88) 0%, rgba(8, 12, 10, 0.94) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 0 60px rgba(16, 185, 129, 0.04), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex flex-col gap-4">
          <div>
            <h3
              className="text-base font-semibold text-[var(--text)]"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Solicitar acesso
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {taskTitle}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setType('view')}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                type === 'view'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <Eye
                size={16}
                className={`mt-0.5 flex-shrink-0 ${
                  type === 'view' ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    type === 'view' ? 'text-emerald-400' : 'text-[var(--text)]'
                  }`}
                >
                  Visualizar detalhes
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Ver informações completas da task
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('participate')}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                type === 'participate'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <UserPlus
                size={16}
                className={`mt-0.5 flex-shrink-0 ${
                  type === 'participate'
                    ? 'text-emerald-400'
                    : 'text-[var(--text-muted)]'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    type === 'participate' ? 'text-emerald-400' : 'text-[var(--text)]'
                  }`}
                >
                  Participar da task
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Ser atribuído e poder alterar o status
                </p>
              </div>
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem para o admin (opcional)..."
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] resize-none placeholder:text-[var(--text-muted)]/50 transition-all"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="text-xs px-4 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-white/[0.12] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="text-xs px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer border border-emerald-500/20"
            >
              Enviar solicitação
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
