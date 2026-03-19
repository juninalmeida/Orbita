import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white active:scale-95',
    ghost:
      'bg-transparent border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-muted)] hover:text-[var(--text)]',
  }

  return (
    <button
      className={`${base} ${variants[variant]}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
      ) : (
        children
      )}
    </button>
  )
}
