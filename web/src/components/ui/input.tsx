import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3 rounded-xl text-sm text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]/50 ${
          error
            ? 'border border-[var(--danger)] bg-[var(--danger)]/5'
            : 'border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(16,185,129,0.08)]'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  )
}
