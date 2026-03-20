import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Archive,
  Inbox,
  Search,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePendingRequests } from '@/hooks/use-admin'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  badge?: number
}

function AdminRequestsBadge({ collapsed }: { collapsed: boolean }) {
  const { requests } = usePendingRequests()
  const count = requests.length

  if (count === 0) return null

  return (
    <span
      className={`flex items-center justify-center text-[10px] font-bold bg-amber-500 text-black rounded-full ${
        collapsed ? 'absolute -top-1 -right-1 w-4 h-4' : 'ml-auto w-5 h-5'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  const isAdmin = user?.role === 'admin'

  const adminItems: NavItem[] = [
    { label: 'Overview', to: '/admin', icon: <LayoutDashboard size={16} className="flex-shrink-0" /> },
    { label: 'Arquivadas', to: '/admin/archived', icon: <Archive size={16} className="flex-shrink-0" /> },
    { label: 'Solicitações', to: '/admin/requests', icon: <Inbox size={16} className="flex-shrink-0" /> },
    { label: 'Usuários', to: '/admin/users', icon: <Users size={16} className="flex-shrink-0" /> },
  ]

  const memberItems: NavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={16} className="flex-shrink-0" /> },
    { label: 'Disponíveis', to: '/dashboard/available', icon: <Search size={16} className="flex-shrink-0" /> },
    { label: 'Concluídas', to: '/dashboard/completed', icon: <CheckCircle2 size={16} className="flex-shrink-0" /> },
    { label: 'Equipes', to: '/dashboard/teams', icon: <Users size={16} className="flex-shrink-0" /> },
  ]

  const navItems = isAdmin ? adminItems : memberItems

  const isActive = (to: string) => {
    if (to === '/admin') return pathname === '/admin'
    if (to === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(to)
  }

  return (
    <aside
      className='hidden md:flex h-screen flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out flex-shrink-0 relative z-[2]'
      style={{
        width: collapsed ? 64 : 256,
        background: 'linear-gradient(180deg, rgba(5, 12, 8, 0.97) 0%, rgba(2, 6, 4, 0.99) 100%)',
      }}
    >
      {/* Header */}
      <div className={`h-14 flex items-center border-b border-white/[0.06] overflow-hidden ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        {!collapsed && (
          <span
            className='text-base font-bold text-[var(--text)] tracking-wide whitespace-nowrap'
            style={{
              fontFamily: 'Syne, sans-serif',
              textShadow: '0 0 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            Orbita
          </span>
        )}
        <button
          onClick={onToggle}
          className='w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-emerald-400 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer flex-shrink-0'
          title={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className='flex-1 p-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden'>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={`flex items-center rounded-xl text-sm transition-all duration-200 overflow-hidden whitespace-nowrap
              ${collapsed ? 'justify-center px-0 py-2.5 relative' : 'gap-3 px-3 py-2.5'}
              ${
                isActive(item.to)
                  ? 'bg-[var(--primary)]/10 text-emerald-400 border border-emerald-500/15'
                  : 'text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)] border border-transparent'
              }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
            {isAdmin && item.to === '/admin/requests' && (
              <AdminRequestsBadge collapsed={collapsed} />
            )}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className='p-2 border-t border-white/[0.06]'>
        <div className={`flex items-center rounded-xl transition-all duration-300 ${collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'}`}>
          <div
            className='w-7 h-7 rounded-full bg-emerald-600/60 flex items-center justify-center text-xs font-semibold text-emerald-100 flex-shrink-0 ring-1 ring-emerald-500/20 cursor-pointer'
            title={collapsed ? user?.name : undefined}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-[var(--text)] truncate'>
                  {user?.name}
                </p>
                <p className='text-xs text-[var(--text-muted)] truncate'>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className='text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors duration-150 cursor-pointer flex-shrink-0'
                title='Sair'
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
