import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label
          htmlFor={id}
          className='text-sm font-medium text-[var(--text-muted)]'
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-lg bg-[var(--surface)] border text-[var(--text)] text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] ${
          error
            ? 'border-[var(--danger)]'
            : 'border-[var(--border)] focus:border-[var(--primary)]'
        }`}
        {...props}
      />
      {error && <span className='text-xs text-[var(--danger)]'>{error}</span>}
    </div>
  )
}
