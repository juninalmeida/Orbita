import type { User } from './user'
import type { TaskAssignment } from './assignment'

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  teamId: string
  assignments: TaskAssignment[]
  createdAt: string
  updatedAt: string
  archived: boolean
  archivedAt: string | null
}

export interface TaskHistory {
  id: string
  taskId: string
  oldStatus: TaskStatus | null
  newStatus: TaskStatus
  changedAt: string
  changer: User
  justification: string | null
}
