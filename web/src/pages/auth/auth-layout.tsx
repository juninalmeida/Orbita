interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold text-[var(--text)] mb-1"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {title}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
