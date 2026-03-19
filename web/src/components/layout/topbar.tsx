import { useLocation } from 'react-router-dom'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Times',
}

export function Topbar() {
  const { pathname } = useLocation()
  const title = routeTitles[pathname] ?? 'Orbita'

  return (
    <header className='h-14 border-b border-[var(--border)] flex items-center px-6'>
      <h1
        className='text-sm font-semibold text-[var(--text)]'
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {title}
      </h1>
    </header>
  )
}