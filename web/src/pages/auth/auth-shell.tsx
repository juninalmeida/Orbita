import { Outlet } from 'react-router-dom'
import { Starfield } from '@/components/effects/starfield'
import { Aurora } from '@/components/effects/aurora'

export function AuthShell() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] px-4 relative overflow-hidden">
      <Aurora />
      <Starfield />
      <Outlet />
    </div>
  )
}
