import { useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { useCompletedTasks, useAllTeams } from '@/hooks/use-task-requests'
import { TaskDetailModal } from '@/components/task/task-detail-modal'

const priorityStyles: Record<string, string> = {
  high: 'text-[var(--danger)] bg-[var(--danger)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  low: 'text-[var(--text-muted)] bg-white/5',
}

interface CompletedTask {
  id: string
  title: string
  priority: string
  updatedAt: string
  assignee?: { id: string; name: string } | null
  team?: { id: string; name: string }
}

export function CompletedTasksPage() {
  const { teams } = useAllTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { completedTasks, isLoading } = useCompletedTasks(selectedTeamId || undefined)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedTeam = teams.find((t: { id: string }) => t.id === selectedTeamId)

  return (
    <div className="min-w-0">
      <h1
        className="text-xl font-bold text-[var(--text)] mb-6"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        Tasks Concluídas
      </h1>

      {/* Team filter */}
      <div className="relative mb-6">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-[var(--text)] hover:border-white/[0.12] transition-all cursor-pointer"
          style={{
            background:
              'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
          }}
        >
          {selectedTeam ? selectedTeam.name : 'Todos os times'}
          <ChevronDown
            size={14}
            className={`text-[var(--text-muted)] transition-transform ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {dropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-white/[0.06] py-1 z-10"
            style={{
              background:
                'linear-gradient(145deg, rgba(10, 18, 14, 0.95) 0%, rgba(8, 12, 10, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <button
              onClick={() => {
                setSelectedTeamId('')
                setDropdownOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                !selectedTeamId
                  ? 'text-emerald-400 bg-emerald-500/5'
                  : 'text-[var(--text)] hover:bg-white/[0.04]'
              }`}
            >
              Todos os times
            </button>
            {teams.map((team: { id: string; name: string }) => (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeamId(team.id)
                  setDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  team.id === selectedTeamId
                    ? 'text-emerald-400 bg-emerald-500/5'
                    : 'text-[var(--text)] hover:bg-white/[0.04]'
                }`}
              >
                {team.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks list */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[var(--card)] animate-pulse"
            />
          ))}
        </div>
      ) : completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 size={32} className="text-[var(--text-muted)] mb-3 opacity-40" />
          <p className="text-sm text-[var(--text-muted)]">
            Nenhuma task concluída
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {completedTasks.map((task: CompletedTask) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="rounded-xl px-4 py-3 border border-white/[0.06] flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/15 transition-all"
              style={{
                background:
                  'linear-gradient(145deg, rgba(10, 18, 14, 0.45) 0%, rgba(8, 12, 10, 0.6) 100%)',
              }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-[var(--text)] truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  {task.team && (
                    <span className="text-teal-400">{task.team.name}</span>
                  )}
                  {task.assignee && (
                    <span>{task.assignee.name}</span>
                  )}
                  <span>
                    {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    priorityStyles[task.priority] ?? 'text-[var(--text-muted)] bg-white/5'
                  }`}
                >
                  {task.priority}
                </span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  )
}
