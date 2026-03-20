import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { useAdminAnalytics } from '@/hooks/use-admin'

const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f43f5e',
}

const EMERALD_400 = '#34d399'
const EMERALD_500 = '#10b981'
const GRID_COLOR = 'rgba(255,255,255,0.06)'
const AXIS_COLOR = 'rgba(255,255,255,0.3)'

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 border border-white/[0.06]"
      style={{
        background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.8), rgba(8, 12, 10, 0.88))',
        backdropFilter: 'blur(20px)',
      }}
    >
      <h3
        className="text-sm font-semibold text-[var(--text)] mb-4"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name?: string; payload?: Record<string, unknown> }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs border border-white/[0.06]"
      style={{
        background: 'rgba(5, 12, 8, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {label && <p className="text-[var(--text-muted)] mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-[var(--text)] font-medium">
          {entry.value}
        </p>
      ))}
    </div>
  )
}

interface WeeklyData {
  week: string
  count: number
}

interface PriorityData {
  name: string
  value: number
}

interface MemberData {
  name: string
  changes: number
}

export function AnalyticsCharts() {
  const { data, isLoading } = useAdminAnalytics()
  const prefersReducedMotion = usePrefersReducedMotion()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl h-72 border border-white/[0.06] animate-pulse"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 18, 14, 0.4), rgba(8, 12, 10, 0.5))',
            }}
          />
        ))}
      </div>
    )
  }

  if (!data) return null

  const weeklyData: WeeklyData[] = (data.tasksPerWeek ?? []).map(
    (item: { week: string; count: number }) => ({
      week: formatWeekDate(item.week),
      count: item.count,
    })
  )

  const priorityData: PriorityData[] = (data.priorityDistribution ?? []).map(
    (item: { priority: string; count: number }) => ({
      name: item.priority,
      value: item.count,
    })
  )

  const memberData: MemberData[] = data.topMembers ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Line chart - Tasks por semana */}
      <ChartCard title="Tasks por semana">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={EMERALD_400}
                strokeWidth={2}
                dot={{ fill: EMERALD_500, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: EMERALD_400, r: 5, strokeWidth: 0 }}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Donut chart - Distribuicao de Prioridade */}
      <ChartCard title="Distribuicao de Prioridade">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={!prefersReducedMotion}
              >
                {priorityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] ?? '#64748b'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-[var(--text-muted)]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Horizontal bar chart - Membros mais ativos */}
      <ChartCard title="Membros mais ativos">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
                axisLine={{ stroke: GRID_COLOR }}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="changes"
                fill={EMERALD_500}
                radius={[0, 4, 4, 0]}
                isAnimationActive={!prefersReducedMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}

function formatWeekDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  } catch {
    return dateStr
  }
}
