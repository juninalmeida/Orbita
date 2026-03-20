import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="flex items-center justify-around h-14 px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer ${
            pathname === '/dashboard'
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <LayoutDashboard size={18} />
          <span style={{ fontFamily: 'Syne, sans-serif' }}>Times</span>
        </button>

        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-1 text-xs text-[var(--text-muted)] transition-colors cursor-pointer hover:text-[var(--danger)]"
        >
          <LogOut size={18} />
          <span style={{ fontFamily: 'Syne, sans-serif' }}>Sair</span>
        </button>
      </div>
    </nav>
  )
}
