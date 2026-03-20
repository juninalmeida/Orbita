import { ClipboardList, CheckCircle2, TrendingUp } from 'lucide-react'

interface ProfileMetricsProps {
  totalAssigned: number
  totalCompleted: number
  completionRate: number
}

const cards = [
  {
    key: 'assigned',
    label: 'Atribuídas',
    icon: ClipboardList,
    getValue: (m: ProfileMetricsProps) => m.totalAssigned,
  },
  {
    key: 'completed',
    label: 'Concluídas',
    icon: CheckCircle2,
    getValue: (m: ProfileMetricsProps) => m.totalCompleted,
  },
  {
    key: 'rate',
    label: 'Taxa de Conclusão',
    icon: TrendingUp,
    getValue: (m: ProfileMetricsProps) => `${m.completionRate}%`,
  },
] as const

export function ProfileMetrics(props: ProfileMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ key, label, icon: Icon, getValue }) => (
        <div
          key={key}
          className="rounded-xl p-4 border border-white/[0.06] flex flex-col items-center gap-2"
          style={{
            background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.6), rgba(8, 12, 10, 0.8))',
          }}
        >
          <Icon size={16} className="text-emerald-400" />
          <span
            className="text-xl font-bold text-[var(--text)]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {getValue(props)}
          </span>
          <span className="text-xs text-[var(--text-muted)] text-center">{label}</span>
        </div>
      ))}
    </div>
  )
}
