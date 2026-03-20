import type { TaskHistory } from '@/types/task'

interface HistoryTimelineProps {
  history: TaskHistory[]
}

const statusLabels = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)]">
        Nenhuma alteração ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-600/50 flex items-center justify-center text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/20 flex-shrink-0 mt-0.5">
            {entry.changer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-[var(--text)]">
              <span className="font-medium">{entry.changer.name}</span>
              {entry.oldStatus ? (
                <>
                  {' '}
                  moveu de{' '}
                  <span className="text-[var(--text-muted)]">
                    {statusLabels[entry.oldStatus]}
                  </span>{' '}
                  para{' '}
                  <span className="text-[var(--primary)]">
                    {statusLabels[entry.newStatus]}
                  </span>
                </>
              ) : (
                <>
                  {' '}
                  criou como{' '}
                  <span className="text-[var(--primary)]">
                    {statusLabels[entry.newStatus]}
                  </span>
                </>
              )}
            </p>
            {entry.justification && (
              <p className="text-xs text-[var(--text-muted)]/70 italic mt-1 pl-2 border-l-2 border-emerald-500/20">
                &ldquo;{entry.justification}&rdquo;
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(entry.changedAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
