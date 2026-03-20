export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 bg-[var(--bg)] flex items-center justify-center"
      style={{ animation: 'dashboard-enter 0.4s ease-out' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border border-emerald-500/30"
            style={{ animation: 'spin-slow 3s linear infinite' }}
          />
          <div
            className="absolute inset-1 rounded-full border border-emerald-400/60"
            style={{ animation: 'spin-reverse 2s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
        </div>
        <span
          className="text-xs text-[var(--text-muted)] tracking-widest uppercase"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Orbita
        </span>
      </div>
    </div>
  )
}
