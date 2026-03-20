import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { usePendingAssignments } from '@/hooks/use-assignments'
import { toast } from 'sonner'

export function NotificationsBell() {
  const { pending, respond } = usePendingAssignments()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleRespond(id: string, status: 'assigned' | 'rejected') {
    respond(
      { id, status },
      {
        onSuccess: () => {
          toast.success(status === 'assigned' ? 'Solicitacao aceita!' : 'Solicitacao rejeitada')
        },
        onError: () => {
          toast.error('Erro ao processar solicitacao')
        },
      },
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-emerald-400 hover:bg-white/[0.06] transition-all cursor-pointer"
      >
        <Bell size={16} />
        {pending.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-emerald-500 text-black rounded-full">
            {pending.length > 9 ? '9+' : pending.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/[0.06] z-50"
          style={{
            background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.95) 0%, rgba(8, 12, 10, 0.98) 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
              Notificacoes
            </p>
          </div>

          {pending.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">Nenhuma solicitacao pendente</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {pending.map((item) => (
                <div key={item.id} className="px-4 py-3 border-b border-white/[0.04] last:border-0">
                  <p className="text-xs text-[var(--text)] mb-1">
                    <span className="font-medium text-emerald-400">{item.requestedBy?.name ?? 'Alguem'}</span>
                    {' '}pediu sua ajuda em
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-2 truncate">
                    {item.task?.title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(item.id, 'assigned')}
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleRespond(item.id, 'rejected')}
                      className="text-xs px-3 py-1 rounded-lg bg-white/[0.04] text-[var(--text-muted)] hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
