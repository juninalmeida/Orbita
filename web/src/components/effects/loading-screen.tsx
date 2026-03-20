export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[var(--bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-30"
            style={{ animation: 'spin-slow 3s linear infinite' }}
          />
          <div
            className="absolute inset-1 rounded-full border border-[var(--primary)] opacity-60"
            style={{ animation: 'spin-reverse 2s linear infinite' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
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
