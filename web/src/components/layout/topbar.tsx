import { useLocation } from 'react-router-dom'
import { NotificationsBell } from '@/components/notifications/notifications-bell'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Times',
}

export function Topbar() {
  const { pathname } = useLocation()
  const title = routeTitles[pathname] ?? 'Orbita'

  return (
    <header className='h-14 border-b border-white/[0.06] flex items-center justify-between px-6 relative'>
      <h1
        className='text-sm font-semibold text-[var(--text)]'
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {title}
      </h1>
      <NotificationsBell />
      <div
        className='absolute bottom-0 left-[5%] right-[5%] h-px pointer-events-none'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.15), transparent)',
        }}
      />
    </header>
  )
}
