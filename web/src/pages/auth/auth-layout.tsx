import { useRef } from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  isLeaving?: boolean
}

export function AuthLayout({ children, title, subtitle, isLeaving }: AuthLayoutProps) {
  const hasEntered = useRef(false)

  const animation = isLeaving
    ? 'auth-fade-out 0.6s ease-in forwards'
    : hasEntered.current
      ? 'none'
      : 'auth-fade-in 0.4s ease-out forwards'

  if (!isLeaving) hasEntered.current = true

  return (
    <div
      className="w-full max-w-[400px] relative z-10"
      style={{ animation }}
    >
      <div className="mb-10 text-center">
        <h1
          className="text-4xl font-bold tracking-wide text-[var(--text)] mb-2"
          style={{
            fontFamily: 'Syne, sans-serif',
            textShadow:
              '0 0 40px rgba(34, 197, 94, 0.25), 0 0 80px rgba(16, 185, 129, 0.1)',
          }}
        >
          {title}
        </h1>
        <p className="text-sm text-[var(--text-muted)] tracking-wide">
          {subtitle}
        </p>
      </div>

      <div
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, rgba(10, 18, 14, 0.8) 0%, rgba(8, 12, 10, 0.88) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow:
            '0 0 80px rgba(22, 163, 74, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Top edge shine — aurora green tint */}
        <div
          className="absolute top-0 left-[8%] right-[8%] h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.3), rgba(34, 197, 94, 0.2), transparent)',
          }}
        />
        {children}
      </div>
    </div>
  )
}
