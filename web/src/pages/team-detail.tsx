import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return null

  return (
    <div className="min-w-0">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Times
      </button>

      <KanbanBoard teamId={id} />
    </div>
  )
}
