import type { User } from './user'

export interface Team {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count?: {
    members: number
    tasks: number
  }
}

export interface TeamMember {
  id: string
  role: 'admin' | 'member'
  user: User
}
