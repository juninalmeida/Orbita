import { Link } from 'react-router-dom'

interface UserAvatarProps {
  name: string
  avatar?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  userId?: string
  className?: string
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-9 h-9 text-sm',
}

export function UserAvatar({ name, avatar, size = 'sm', userId, className = '' }: UserAvatarProps) {
  const sizeClass = sizeClasses[size]

  const content = avatar ? (
    <img
      src={avatar}
      alt={name}
      className={`${sizeClass} rounded-full object-cover ring-1 ring-emerald-500/20 flex-shrink-0 ${className}`}
    />
  ) : (
    <div
      className={`${sizeClass} rounded-full bg-emerald-600/50 flex items-center justify-center font-semibold text-emerald-100 ring-1 ring-emerald-500/20 flex-shrink-0 ${className}`}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  )

  if (userId) {
    return (
      <Link to={`/users/${userId}`} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
