import { useState } from 'react'
import { Trash2, Archive, Check, XCircle } from 'lucide-react'

interface TaskAdminActionsProps {
  onArchive: () => void
  onDelete: () => void
  isArchiving: boolean
  isDeleting: boolean
}

export function TaskAdminActions({ onArchive, onDelete, isArchiving, isDeleting }: TaskAdminActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
      <button
        onClick={onArchive}
        disabled={isArchiving}
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:border-white/[0.12] hover:text-[var(--text)] transition-all cursor-pointer disabled:opacity-40"
      >
        <Archive size={13} />
        Archive
      </button>
      {showDeleteConfirm ? (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[var(--text-muted)]">Confirm?</span>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Check size={13} />
            Yes
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <XCircle size={13} />
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer ml-auto"
        >
          <Trash2 size={13} />
          Delete
        </button>
      )}
    </div>
  )
}
