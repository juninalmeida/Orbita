import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function Sidebar() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  return (
    <aside className='w-64 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--surface)]'>
      <div className='h-14 flex items-center px-5 border-b border-[var(--border)]'>
        <span
          className='text-base font-bold text-[var(--text)] tracking-wide'
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Orbita
        </span>
      </div>

      <nav className='flex-1 p-3 flex flex-col gap-1 overflow-y-auto'>
        <Link
          to='/dashboard'
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
            ${
              pathname === '/dashboard'
                ? 'bg-[var(--primary-glow)] text-[var(--primary)]'
                : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text)]'
            }`}
        >
          <LayoutDashboard size={16} />
          Times
        </Link>
      </nav>

      <div className='p-3 border-t border-[var(--border)]'>
        <div className='flex items-center gap-3 px-3 py-2 rounded-lg'>
          <div className='w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-semibold text-white flex-shrink-0'>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
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
            className='text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors duration-150 cursor-pointer'
            title='Sair'
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}