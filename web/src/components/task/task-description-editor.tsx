import { useState } from 'react'

interface TaskDescriptionEditorProps {
  description?: string | null
  isAdmin: boolean
  onSave: (description: string | null) => void
}

export function TaskDescriptionEditor({ description, isAdmin, onSave }: TaskDescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  function handleStartEdit() {
    if (!isAdmin) return
    setEditValue(description ?? '')
    setIsEditing(true)
  }

  function handleSave() {
    onSave(editValue.trim() || null)
    setIsEditing(false)
  }

  if (isAdmin && isEditing) {
    return (
      <div className="flex flex-col gap-2 mt-1">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] outline-none focus:border-emerald-500/40 resize-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditing(false)
          }}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  if (description) {
    return (
      <p
        className={`text-sm text-[var(--text-muted)] ${isAdmin ? 'cursor-pointer hover:text-[var(--text)] transition-colors' : ''}`}
        onClick={handleStartEdit}
      >
        {description}
      </p>
    )
  }

  if (isAdmin) {
    return (
      <p
        className="text-sm text-[var(--text-muted)]/50 cursor-pointer hover:text-[var(--text-muted)] transition-colors italic"
        onClick={handleStartEdit}
      >
        Add description...
      </p>
    )
  }

  return null
}
