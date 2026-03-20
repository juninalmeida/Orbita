import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Archive, Inbox, Search, CheckCircle2, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePendingRequests } from '@/hooks/use-admin'

function AdminRequestsBadgeMobile() {
  const { requests } = usePendingRequests()
  const count = requests.length

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-amber-500 text-black rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  )
}

interface MobileNavItem {
  label: string
  to: string
  icon: React.ReactNode
  showBadge?: boolean
}

export function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const isAdmin = user?.role === 'admin'

  const isActive = (to: string) => {
    if (to === '/admin') return pathname === '/admin'
    if (to === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(to)
  }

  const adminItems: MobileNavItem[] = [
    { label: 'Overview', to: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Arquivadas', to: '/admin/archived', icon: <Archive size={18} /> },
    { label: 'Solicitações', to: '/admin/requests', icon: <Inbox size={18} />, showBadge: true },
  ]

  const memberItems: MobileNavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Disponíveis', to: '/dashboard/available', icon: <Search size={18} /> },
    { label: 'Concluídas', to: '/dashboard/completed', icon: <CheckCircle2 size={18} /> },
    { label: 'Equipes', to: '/dashboard/teams', icon: <Users size={18} /> },
  ]

  const navItems = isAdmin ? adminItems : memberItems

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/[0.06]"
      style={{
        background: 'rgba(5, 10, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-around h-14 px-4">
        {navItems.map((item) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={`relative flex flex-col items-center gap-1 text-xs transition-colors cursor-pointer ${
              isActive(item.to)
                ? 'text-emerald-400'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {item.icon}
            <span style={{ fontFamily: 'Syne, sans-serif' }}>{item.label}</span>
            {isAdmin && item.showBadge && <AdminRequestsBadgeMobile />}
          </button>
        ))}

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
