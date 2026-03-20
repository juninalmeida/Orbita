import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  suffix?: string
}

export function MetricCard({ icon: Icon, label, value, suffix }: MetricCardProps) {
  return (
    <div
      className="rounded-xl p-5 border border-white/[0.06]"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.25))' }}
        >
          <Icon size={16} className="text-emerald-400" />
        </div>
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-[var(--text-muted)]">{suffix}</span>
        )}
      </div>
    </div>
  )
}
