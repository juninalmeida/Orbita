import { useState } from 'react'

interface JustificationModalProps {
  isOpen: boolean
  newStatus: string
  onConfirm: (justification: string) => void
  onCancel: () => void
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

export function JustificationModal({
  isOpen,
  newStatus,
  onConfirm,
  onCancel,
}: JustificationModalProps) {
  const [justification, setJustification] = useState('')

  if (!isOpen) return null

  const isValid = justification.trim().length >= 10

  function handleConfirm() {
    if (isValid) {
      onConfirm(justification.trim())
      setJustification('')
    }
  }

  function handleCancel() {
    setJustification('')
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
              Justificativa de alteração
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Explique por que você está alterando o status para{' '}
              <span className="text-emerald-400">
                {statusLabels[newStatus] ?? newStatus}
              </span>
            </p>
          </div>

          <div>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva o motivo da mudança (mínimo 10 caracteres)..."
              rows={4}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] resize-none placeholder:text-[var(--text-muted)]/50 transition-all"
              autoFocus
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              {justification.trim().length}/10 caracteres mínimos
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="text-xs px-4 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-white/[0.12] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="text-xs px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/20"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
