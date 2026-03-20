import { useState } from 'react'
import { Check } from 'lucide-react'

interface TaskTitleEditorProps {
  title: string
  isAdmin: boolean
  onSave: (title: string) => void
}

export function TaskTitleEditor({ title, isAdmin, onSave }: TaskTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  function handleStartEdit() {
    if (!isAdmin) return
    setEditValue(title)
    setIsEditing(true)
  }

  function handleSave() {
    if (!editValue.trim()) return
    onSave(editValue.trim())
    setIsEditing(false)
  }

  if (isAdmin && isEditing) {
    return (
      <div className="flex gap-2">
        <input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-base font-semibold text-[var(--text)] outline-none focus:border-emerald-500/40"
          style={{ fontFamily: 'Syne, sans-serif' }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
        />
        <button
          onClick={handleSave}
          className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <Check size={16} />
        </button>
      </div>
    )
  }

  return (
    <h2
      className={`text-base font-semibold text-[var(--text)] mb-1 ${isAdmin ? 'cursor-pointer hover:text-emerald-400 transition-colors' : ''}`}
      style={{ fontFamily: 'Syne, sans-serif' }}
      onClick={handleStartEdit}
    >
      {title}
    </h2>
  )
}
